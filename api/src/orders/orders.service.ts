import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { APP_STORE } from '../store/store.constants';
import { AppStore, Order } from '../store/store';

/** Service fee applied on top of the ticket subtotal. */
export const SERVICE_FEE_PERCENT = 10;

/** Minutes a pending order holds inventory before it expires. */
export const ORDER_TTL_MINUTES = 15;

@Injectable()
export class OrdersService {
  constructor(@Inject(APP_STORE) private readonly store: AppStore) {}

  /**
   * Creates a pending order and holds inventory.
   *
   * The implementation below is intentionally incomplete: the UI can still
   * create orders, but several product rules are missing. See README.md and
   * orders.service.spec.ts.
   */
  create(dto: CreateOrderDto): Order {
    this.releaseExpiredOrders();

    if (dto.items.length === 0) {
      throw new BadRequestException(
        'Debes seleccionar al menos una localidad',
      );
    }

    const event = this.store.events.find((item) => item.id === dto.eventId);

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    const seen = new Set<string>();

    const lines = dto.items.map((line) => {
      if (seen.has(line.ticketTypeId)) {
        throw new BadRequestException(
          'No repitas la misma localidad en una orden',
        );
      }
      seen.add(line.ticketTypeId);

      if (!Number.isInteger(line.quantity) || line.quantity < 1) {
        throw new BadRequestException(
          'La cantidad debe ser un entero de al menos 1',
        );
      }

      const ticketType = event.ticketTypes.find(
        (type) => type.id === line.ticketTypeId,
      );

      if (!ticketType) {
        throw new NotFoundException('Localidad no encontrada');
      }

      if (ticketType.remaining === 0) {
        throw new BadRequestException(`${ticketType.name} está agotada`);
      }

      if (line.quantity > ticketType.maxPerOrder) {
        throw new BadRequestException(
          `Máximo ${ticketType.maxPerOrder} entradas ${ticketType.name} por orden`,
        );
      }

      if (line.quantity > ticketType.remaining) {
        throw new BadRequestException(
          `Solo quedan ${ticketType.remaining} entradas ${ticketType.name}`,
        );
      }

      return {
        ticketType,
        item: {
          ticketTypeId: ticketType.id,
          name: ticketType.name,
          quantity: line.quantity,
          unitPriceCents: ticketType.priceCents,
          lineTotalCents: ticketType.priceCents * line.quantity,
        },
      };
    });

    // Every line is valid: only now hold inventory, so a failing line
    // never leaves stock partially decremented.
    for (const { ticketType, item } of lines) {
      ticketType.remaining -= item.quantity;
    }

    const items = lines.map(({ item }) => item);
    const subtotalCents = items.reduce(
      (sum, item) => sum + item.lineTotalCents,
      0,
    );

    const feeCents = Math.round((subtotalCents * SERVICE_FEE_PERCENT) / 100);

    const now = new Date();
    const order: Order = {
      id: `ord_${randomUUID()}`,
      eventId: event.id,
      status: 'pending',
      items,
      subtotalCents,
      feeCents,
      totalCents: subtotalCents + feeCents,
      buyer: null,
      createdAt: now.toISOString(),
      expiresAt: new Date(
        now.getTime() + ORDER_TTL_MINUTES * 60_000,
      ).toISOString(),
    };

    this.store.orders.set(order.id, order);
    return order;
  }

  findById(id: string): Order {
    this.releaseExpiredOrders();

    const order = this.store.orders.get(id);

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  confirm(id: string, dto: ConfirmOrderDto): Order {
    const order = this.findById(id);

    if (order.status === 'expired') {
      throw new BadRequestException(
        'La orden expiró. Elige tus entradas de nuevo',
      );
    }

    if (order.status !== 'pending') {
      throw new BadRequestException('La orden ya fue confirmada');
    }

    order.status = 'confirmed';
    order.buyer = { name: dto.name, email: dto.email };
    return order;
  }

  /** Expires overdue pending orders and returns their held stock. */
  private releaseExpiredOrders(): void {
    const now = Date.now();

    for (const order of this.store.orders.values()) {
      if (order.status !== 'pending' || Date.parse(order.expiresAt) > now) {
        continue;
      }

      const event = this.store.events.find((item) => item.id === order.eventId);

      for (const item of order.items) {
        const ticketType = event?.ticketTypes.find(
          (type) => type.id === item.ticketTypeId,
        );
        if (ticketType) ticketType.remaining += item.quantity;
      }

      order.status = 'expired';
    }
  }
}
