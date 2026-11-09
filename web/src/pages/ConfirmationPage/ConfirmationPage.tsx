import { Link } from 'react-router';
import { Badge } from '~/components';
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

  if (view === 'expired') {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-medium tracking-tight">
          Esta orden expiró
        </h1>
        <p className="mt-4 text-ink/70">
          Pasaron más de 15 minutos sin confirmar y las entradas se liberaron.
          Puedes elegirlas de nuevo.
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
    <main className="flex flex-col items-center gap-6 px-4 py-10">
      <div className="text-center">
        <h1 className="mt-4 text-3xl font-medium tracking-tight">
          ¡Gracias por tu compra!
        </h1>
        <p className="mt-2 text-sm text-ink/70">
          {order.buyer?.email
            ? `Te enviaremos el comprobante al correo ${order.buyer.email}.`
            : 'Tu compra fue confirmada.'}
        </p>
        <Badge variant="neutral" className="mt-3">
          Número de orden <code className="font-semibold">{order.id}</code>
        </Badge>
      </div>

      <div className="w-full max-w-xl rounded-2xl bg-white p-6 ring-1 ring-black/5 md:w-1/2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/50">Evento</p>
            <h2 className="mt-1 text-lg font-medium">
              {eventTitle ?? 'Tu comprobante'}
            </h2>
            <p className="mt-1 text-xs text-ink/60">
              Orden <code>{order.id}</code>
            </p>
          </div>
          <Badge variant="success">Confirmada</Badge>
        </div>

        <section className="mt-5 border-t border-black/10 pt-4">
          <h3 className="text-xs uppercase tracking-wide text-ink/50">
            Comprador
          </h3>
          <p className="mt-1 text-sm font-medium">{order.buyer?.name}</p>
          <p className="text-sm text-ink/70">{order.buyer?.email}</p>
        </section>

        <section className="mt-5 border-t border-black/10 pt-4">
          <h3 className="text-xs uppercase tracking-wide text-ink/50">
            Entradas
          </h3>
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

        <dl className="mt-5 space-y-1 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between text-ink/70">
            <dt>Subtotal</dt>
            <dd>{formatUsd(order.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between text-ink/70">
            <dt>Cargo por servicio (10%)</dt>
            <dd>{formatUsd(order.feeCents)}</dd>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold">
            <dt>Total pagado</dt>
            <dd>{formatUsd(order.totalCents)}</dd>
          </div>
        </dl>

        <Link
          to="/"
          className="mt-6 block w-full rounded-xl bg-blue-500 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-600"
        >
          Volver a eventos
        </Link>
      </div>
    </main>
  );
}
