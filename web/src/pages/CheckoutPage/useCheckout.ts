import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import {
  ConfirmOrderBody,
  confirmOrder,
  CreateOrderBody,
  createOrder,
  useApiMutation,
} from '~/api';
import { CheckoutState, Order } from '~/types';
import { CheckoutFormValues, checkoutSchema } from './checkout.schema';

export type CheckoutError = {
  title: string;
  message: string;
  /** 'reselect': the order was rejected, pick tickets again. 'retry': try again. */
  action: 'reselect' | 'retry';
};

const NETWORK_MESSAGE = 'No pudimos conectar con el servidor. Inténtalo de nuevo.';

function toCheckoutError(
  error: unknown,
  stage: 'create' | 'confirm',
): CheckoutError {
  // fetch rejects with a TypeError when the API can't be reached.
  if (error instanceof TypeError) {
    return {
      title: 'Sin conexión',
      message: NETWORK_MESSAGE,
      action: 'retry',
    };
  }

  const message = error instanceof Error ? error.message : 'Ha ocurrido un error';

  return stage === 'create'
    ? { title: 'No pudimos crear tu orden', message, action: 'reselect' }
    : { title: 'No pudimos confirmar tu compra', message, action: 'retry' };
}

export function useCheckout(selection: CheckoutState | null) {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<CheckoutError | null>(
    null,
  );
  // Values waiting to be confirmed right after the order is created.
  const pendingValues = useRef<CheckoutFormValues | null>(null);

  const form = useForm<CheckoutFormValues>({
    resolver: yupResolver(checkoutSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '' },
  });

  const create = useApiMutation<Order, Record<string, never>, CreateOrderBody>(
    createOrder,
  );
  // confirmOrder needs the id in the URL, so the hook is bound to the id kept
  // in state.
  const confirm = useApiMutation<Order, { id: string }, ConfirmOrderBody>(
    confirmOrder,
    { id: orderId ?? '' },
  );

  const confirmWith = async (values: CheckoutFormValues) => {
    try {
      const order = await confirm.mutateAsync(values);
      navigate(`/orders/${order.id}`);
    } catch (error) {
      setCheckoutError(toCheckoutError(error, 'confirm'));
    }
  };

  // Runs once the id is in state, so the confirm hook points at the new URL.
  useEffect(() => {
    if (!orderId || !pendingValues.current) return;

    const values = pendingValues.current;
    pendingValues.current = null;
    void confirmWith(values);
  }, [orderId]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!selection) return;
    setCheckoutError(null);

    // The order already exists: retry only the confirmation.
    if (orderId) {
      await confirmWith(values);
      return;
    }

    try {
      const order = await create.mutateAsync({
        eventId: selection.eventId,
        items: selection.items.map(({ ticketTypeId, quantity }) => ({
          ticketTypeId,
          quantity,
        })),
      });
      pendingValues.current = values;
      setOrderId(order.id);
    } catch (error) {
      setCheckoutError(toCheckoutError(error, 'create'));
    }
  });

  return {
    form,
    onSubmit,
    checkoutError,
    isRetry: orderId !== null,
    isSubmitting: create.isPending || confirm.isPending,
  };
}
