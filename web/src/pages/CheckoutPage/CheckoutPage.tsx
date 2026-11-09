import { Link, Navigate, useLocation } from 'react-router';
import { Alert, TextField } from '~/components';
import { CheckoutState } from '~/types';
import { OrderSummary } from './OrderSummary';
import { useCheckout } from './useCheckout';

export function CheckoutPage() {
  const location = useLocation();
  const selection = location.state as CheckoutState | null;
  const {
    form: {
      register,
      formState: { errors, isValid },
    },
    onSubmit,
    checkoutError,
    isRetry,
    isSubmitting,
  } = useCheckout(selection);

  if (!selection?.items.length) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1fr_280px]">
      <section className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
        <h1 className="text-2xl font-semibold tracking-tight">Tus datos</h1>
        <p className="mt-2 text-sm text-ink/70">
          Completa el checkout para <strong>{selection.eventTitle}</strong>.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          <TextField
            label="Nombre"
            autoComplete="name"
            disabled={isSubmitting}
            error={errors.name?.message}
            {...register('name')}
          />
          <TextField
            label="Correo"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            error={errors.email?.message}
            {...register('email')}
          />

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white enabled:cursor-pointer enabled:hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-ink/20 disabled:text-ink/40"
          >
            {isSubmitting
              ? 'Procesando…'
              : isRetry
                ? 'Reintentar confirmación'
                : 'Confirmar compra'}
          </button>

          {checkoutError && (
            <Alert 
              title={checkoutError.title}
              variant='error' 
              >
              <p>{checkoutError.message}</p>
              {checkoutError.action === 'reselect' && (
                <Link
                  to={`/events/${selection.eventId}`}
                  className="mt-2 inline-block text-red-600"
                >
                  <span aria-hidden className="mr-2">
                    ←
                  </span>
                  <span className="underline">Volver a elegir entradas</span>
                </Link>
              )}
            </Alert>
          )}
        </form>
      </section>
      <OrderSummary items={selection.items} />
    </main>
  );
}
