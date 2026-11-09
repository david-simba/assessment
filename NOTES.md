# Notas

## Estado

Completo. Está hecho todo lo que pedía la prueba: las reglas de las órdenes en el backend (validación, inventario, cargo del 10%, confirmación) y el checkout y la confirmación en el frontend. De los extras elegí uno: la reserva de 15 minutos con liberación del inventario. No quedó nada a medias.

## Sobre el flujo de trabajo

Trabajé directamente en `main` por ser una prueba. En un proyecto real cada feature iría en su propia rama con su PR, por ejemplo `feat/checkout-page` o `feat/order-expiration`.

## Qué hice

**Backend (`api/`)**
- Validación de órdenes: rechaza localidades duplicadas, cantidades menores a 1 o no enteras, más del `maxPerOrder` y más del `remaining` (con un mensaje distinto si la localidad está agotada).
- Reserva de inventario: se validan todas las líneas primero y recién después se descuenta `remaining`, así una línea inválida no deja stock a medias.
- Cargo por servicio: `Math.round(subtotal * 10 / 100)` y `total = subtotal + cargo`, todo en centavos enteros.
- Confirmar una orden que no está `pending` responde 400. Probé con curl cuerpos mal formados y ninguno da 500.
- Expiración: las órdenes pendientes llevan `expiresAt` (15 minutos) y se liberan al consultar o crear. Test con fake timers.
- Tests propios además de los del spec: cantidades inválidas, no sobreventa, atomicidad, redondeo del cargo y expiración. Las pruebas pasan.

**Frontend (`web/`)**
- `TextField`, `Badge` y `Alert`: componentes genéricos en `components/`, cada uno con carpeta, archivo e `index.ts`.
- `CheckoutPage`: formulario con react-hook-form + Yup (`mode: 'onTouched'`), resumen con subtotal, 10% y total antes de enviar. Crea la orden, la confirma y va a `/orders/:id`.
- Reintento: `confirmOrder` necesita el id en la URL, así que el `orderId` se guarda en estado. Si la confirmación falla, el botón reintenta solo la confirmación.
- Errores: se muestran los mensajes de la API en un `Alert`, con el enlace para volver a elegir entradas cuando falla la creación de la orden.
- `ConfirmationPage`: estados de carga, orden no encontrada, orden expirada y orden no confirmada, y el comprobante con el total pagado.
- La lógica va en hooks (`useCheckout`, `useOrder`) y los `.tsx` solo renderizan.

## Qué no me alcanzó

Nada de lo pedido. Lo que dejé fuera, a propósito, por el tiempo:

- **Tests del frontend.** Cubrí con tests el backend, donde están las reglas de negocio (stock, cargo, estados de la orden, expiración). En el frontend verifiqué los flujos a mano, porque montar la infraestructura (Vitest, Testing Library, mocks de la API) no cabía en el tiempo. Lo primero que haría es un test de `useCheckout`, sobre todo el reintento de confirmación.
- **Un caso límite del checkout.** Si el usuario deja el checkout abierto más de 15 minutos tras un fallo de confirmación, el botón seguiría ofreciendo reintentar aunque la orden ya expiró. El mensaje de la API se muestra, pero falta el enlace para volver a elegir entradas.
- **Los otros extras** (código `SAVE10` y agotamiento de entradas mientras alguien está en el checkout), porque el enunciado pedía solo uno.

Cambios fuera de las carpetas de la prueba, ambos solo aditivos y por la expiración: `docs/api.md` (`expiresAt`, estado `expired` y el 400 al confirmar una orden no pendiente) y `web/src/types.ts` (`'expired'` y `expiresAt`, para que la confirmación distinga una orden expirada).

## Qué haría distinto

- Un endpoint idempotente que cree y confirme en una sola llamada. Hoy son dos llamadas y, si falla la segunda, queda una orden `pending` reteniendo stock hasta que expire.
- Tests en todas las capas: unitarios del frontend (hooks y componentes), tests HTTP (e2e) del backend y e2e del flujo de compra completo en el navegador, además de los del servicio.
- Un filtro global de excepciones en el backend (`ExceptionFilter` de Nest) para unificar el formato de los errores. No es un middleware: el filtro actúa sobre las excepciones ya lanzadas, mientras que el middleware corre antes del controlador.
- Componentes globales y una librería de diseño ya hecha (por ejemplo shadcn) con su set de iconos, en vez de componentes propios con caracteres de texto como iconos. `TextField`, `Badge` y `Alert` quedan como base mientras tanto.
- Migrar a una arquitectura limpia por capas (data / dominio / presentación) para mejorar el mantenimiento y la escalabilidad. Hoy la lógica de negocio, el acceso a datos y la UI conviven en pocos archivos, lo que basta para este alcance pero se vuelve costoso al crecer.

## Deuda menor

- El desglose de subtotal, cargo y total está duplicado entre el resumen del checkout y la confirmación.
- El stock vive en memoria: se pierde al reiniciar la API y no hay identidad de comprador, así que el tope de 2 VIP es por orden, no por persona.

## Observación

`TicketStepper` vive en `components/` y solo lo usa una página; lo dejé como venía. Si un componente pertenece a una feature, debe vivir dentro de su página. Y si va a servir en todo el proyecto, lo mejor es hacerlo realmente reutilizable (un `Stepper` genérico, sin referencias a entradas) para que su lugar en `components/` esté justificado.
