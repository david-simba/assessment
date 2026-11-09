import * as yup from 'yup';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const checkoutSchema = yup.object({
  name: yup.string().trim().required('El nombre es obligatorio'),
  email: yup
    .string()
    .trim()
    .required('El correo es obligatorio')
    .email('El correo no es válido')
    .matches(EMAIL_REGEX, 'El correo no es válido'),
});
export type CheckoutFormValues = yup.InferType<typeof checkoutSchema>;
