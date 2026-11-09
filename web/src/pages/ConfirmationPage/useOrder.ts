import { useParams } from 'react-router';
import { eventById, orderById, useApiQuery } from '~/api';
import { EventRecord, Order } from '~/types';

export type OrderView = 'loading' | 'not-found' | 'not-confirmed' | 'ready';

export function useOrder() {
  const { orderId = '' } = useParams();
  const {
    data: order,
    isPending,
    isError,
  } = useApiQuery<Order>(
    orderById,
    { id: orderId },
    { enabled: Boolean(orderId) },
  );

  const { data: event } = useApiQuery<EventRecord>(
    eventById,
    { id: order?.eventId ?? '' },
    { enabled: Boolean(order?.eventId) },
  );

  let view: OrderView = 'ready';
  if (isPending && orderId) view = 'loading';
  else if (isError || !order) view = 'not-found';
  else if (order.status !== 'confirmed') view = 'not-confirmed';

  return { orderId, order, eventTitle: event?.title, view };
}
