import { feeFromSubtotal, formatUsd } from '~/lib/money';
import { TicketSelection } from '~/types';

type OrderSummaryProps = {
  items: TicketSelection[];
};

export function OrderSummary({ items }: OrderSummaryProps) {
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );
  const feeCents = feeFromSubtotal(subtotalCents);

  return (
    <aside className="h-max rounded-2xl bg-white p-5 ring-1 ring-black/5">
      <h2 className="font-semibold">Resumen</h2>
      <ul className="mt-3 space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.ticketTypeId} className="flex justify-between">
            <span>
              {item.quantity} × {item.name}
            </span>
            <span>{formatUsd(item.unitPriceCents * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1 border-t border-black/10 pt-3 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatUsd(subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Cargo por servicio (10%)</dt>
          <dd>{formatUsd(feeCents)}</dd>
        </div>
        <div className="flex justify-between font-semibold">
          <dt>Total</dt>
          <dd>{formatUsd(subtotalCents + feeCents)}</dd>
        </div>
      </dl>
    </aside>
  );
}
