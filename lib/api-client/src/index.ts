import type {
  Storefront,
  ProductListItem,
  Product,
  ShippingMethod,
  CheckoutRequest,
  CheckoutResponse,
  Order,
  PaymentConfirmationRequest,
  PaymentConfirmationResponse,
} from "@workspace/shared";

// ---------------------------------------------------------------
// Config
// ---------------------------------------------------------------

function getBaseUrl(): string {
  // Vite env (shop frontend)
  // @ts-expect-error — import.meta.env may not exist in all environments
  const viteUrl = typeof import.meta !== "undefined" ? (import.meta.env?.VITE_API_URL as string | undefined) : undefined;
  // Node.js env (server-side use)
  const nodeUrl = typeof process !== "undefined" ? process.env.BACKEND_URL : undefined;
  return viteUrl ?? nodeUrl ?? "/api";
}

// ---------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = (body as { error?: { code?: string; message?: string; details?: unknown[] } }).error;
    throw new ApiError(
      err?.code ?? "UNKNOWN_ERROR",
      err?.message ?? `HTTP ${res.status}`,
      res.status,
      err?.details,
    );
  }
  return (body as { data: T }).data;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<T>(res);
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

// ---------------------------------------------------------------
// API functions
// ---------------------------------------------------------------

export function getStorefront(): Promise<Storefront> {
  return get<Storefront>("/storefront");
}

export interface GetProductsParams {
  sort?: "newest" | "price_asc" | "price_desc";
}

export function getProducts(params?: GetProductsParams): Promise<ProductListItem[]> {
  const qs = params?.sort ? `?sort=${params.sort}` : "";
  return get<ProductListItem[]>(`/products${qs}`);
}

export function getProductBySlug(slug: string): Promise<Product> {
  return get<Product>(`/products/${encodeURIComponent(slug)}`);
}

export function getShippingMethods(): Promise<ShippingMethod[]> {
  return get<ShippingMethod[]>("/shipping-methods");
}

export function createCheckout(payload: CheckoutRequest): Promise<CheckoutResponse> {
  return post<CheckoutResponse>("/checkout", payload);
}

export function getOrderByCode(orderCode: string): Promise<Order> {
  return get<Order>(`/orders/${encodeURIComponent(orderCode)}`);
}

export function submitPaymentConfirmation(
  orderCode: string,
  payload: PaymentConfirmationRequest,
): Promise<PaymentConfirmationResponse> {
  return post<PaymentConfirmationResponse>(
    `/orders/${encodeURIComponent(orderCode)}/payment-confirmation`,
    payload,
  );
}
