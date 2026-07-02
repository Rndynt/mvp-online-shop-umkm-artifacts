import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

export const checkoutCustomerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(8).max(20),
});

export const checkoutShippingAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional().default(""),
  city: z.string().min(1),
  province: z.string().min(1),
  postalCode: z.string().min(5),
  country: z.string().min(1).default("Indonesia"),
});

export const checkoutRequestSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  customer: checkoutCustomerSchema,
  shippingAddress: checkoutShippingAddressSchema,
  shippingMethodId: z.string().uuid(),
  paymentMethod: z.literal("manual_fake_qris"),
  discountCode: z.string().optional(),
});

export const paymentConfirmationSchema = z.object({
  payerName: z.string().min(1),
  reference: z.string().optional(),
  note: z.string().optional(),
});

export type CheckoutRequestSchema = z.infer<typeof checkoutRequestSchema>;
export type PaymentConfirmationSchema = z.infer<typeof paymentConfirmationSchema>;
