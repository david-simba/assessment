import { Link } from 'react-router';
import { formatUsd } from '~/lib/money';
import { useOrder } from './useOrder';

export function ConfirmationPage() {
  const { order, eventTitle, view } = useOrder();

  if (view === 'loading') {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-ink/60">
        Cargando orden…
      </main>
    );
  }

  if (view === 'not-found' || !order) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-medium tracking-tight">
          No encontramos esta orden
        </h1>
        <p className="mt-3 text-ink/70">
          Revisa el enlace o vuelve a la lista de eventos.
        </p>
        <Link to="/" className="mt-8 inline-block text-accent">
          Volver a eventos
        </Link>
      </main>
    );
  }

  if (view === 'not-confirmed') {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-medium tracking-tight">
          Esta orden aún no está confirmada
        </h1>
        <p className="mt-4 text-ink/70">
          Tus entradas siguen apartadas, pero la compra no se completó.
        </p>
        <Link
          to={`/events/${order.eventId}`}
          className="mt-8 inline-block text-accent"
        >
          Volver al evento
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center gap-2 py-10 md:gap-12">
      <div className="rounded-2xl md:w-1/3 sm:w-full bg-white p-6 ring-1 ring-black/5">
        <div className="flex justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-1 text-xs font-medium text-green-800">
            Compra confirmada
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-medium tracking-tight">
          {eventTitle ?? 'Tu comprobante'}
        </h1>
        <p className="mt-1 text-xs text-ink/60">
          Orden <code>{order.id}</code>
        </p>

        <section className="mt-4">
          <h2 className="text-sm font-medium">Comprador</h2>
          <p className="mt-1 text-sm">Nombre: {order.buyer?.name}</p>
          <p className="text-sm">Correo: {order.buyer?.email}</p>
        </section>
        <dl className="mt-4 space-y-1 border-t border-black/10 text-sm"/>
        <section className="mt-4">
          <h2 className="text-sm font-medium">Entradas</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {order.items.map((item) => (
              <li key={item.ticketTypeId} className="flex justify-between">
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span>{formatUsd(item.lineTotalCents)}</span>
              </li>
            ))}
          </ul>
        </section>

        <dl className="mt-4 space-y-1 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatUsd(order.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Cargo por servicio (10%)</dt>
            <dd>{formatUsd(order.feeCents)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total pagado</dt>
            <dd>{formatUsd(order.totalCents)}</dd>
          </div>
        </dl>
      </div>

      <Link to="/" className="block text-center text-accent">
        Volver a eventos
      </Link>
    </main>
  );
}