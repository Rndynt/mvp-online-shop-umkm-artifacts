// ============================================================
// Storefront
// ============================================================
export interface Storefront {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  announcementText: string | null;
  currency: string;
  country: string;
  contactEmail: string | null;
  contactPhone: string | null;
  activePaymentMethods: string[];
  activeShippingMethods: ShippingMethod[];
}

// ============================================================
// Product
// ============================================================
export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  images: ProductImage[];
  isActive: boolean;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  images: ProductImage[];
}

// ============================================================
// Shipping
// ============================================================
export interface ShippingMethod {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
}

// ============================================================
// Checkout
// ============================================================
export interface CheckoutItem {
  productId: string;
  quantity: number;
}

export interface CheckoutCustomer {
  email: string;
  phone: string;
}

export interface CheckoutShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface CheckoutRequest {
  items: CheckoutItem[];
  customer: CheckoutCustomer;
  shippingAddress: CheckoutShippingAddress;
  shippingMethodId: string;
  paymentMethod: string;
  discountCode?: string;
}

export interface CheckoutResponse {
  orderCode: string;
  payment: PaymentInstruction;
}

// ============================================================
// Order
// ============================================================
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled"
  | "expired";

export type PaymentStatus =
  | "pending"
  | "reviewing"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled";

export interface OrderItem {
  id: string;
  productId: string | null;
  itemType: string;
  nameSnapshot: string;
  skuSnapshot: string | null;
  unitPrice: number;
  compareAtPrice: number | null;
  quantity: number;
  lineTotal: number;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface PaymentInstruction {
  method: string;
  displayName: string;
  status: PaymentStatus;
  amount: number;
  instruction: {
    title: string;
    description: string;
    qrPayload: string;
    expiresAt: string;
  };
}

export interface Order {
  id: string;
  orderCode: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  items: OrderItem[];
  address: OrderAddress;
  payment: PaymentInstruction;
  createdAt: string;
}

// ============================================================
// Payment Confirmation
// ============================================================
export interface PaymentConfirmationRequest {
  payerName: string;
  reference?: string;
  note?: string;
}

export interface PaymentConfirmationResponse {
  success: boolean;
  paymentStatus: PaymentStatus;
}
