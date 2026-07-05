import { db } from "@workspace/db";
import { storesTable } from "@workspace/db/schema";
import type { PaymentConfig, BankAccount } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../lib/errors";
import { requireActiveStore } from "./store.service";

export { PaymentConfig, BankAccount };

export async function getPaymentConfig(): Promise<PaymentConfig> {
  const store = await requireActiveStore();
  const { DEFAULT_PAYMENT_CONFIG } = await import("@workspace/db/schema");
  return store.paymentConfig ?? DEFAULT_PAYMENT_CONFIG;
}

export interface UpdatePaymentConfigInput {
  qrisEnabled?: boolean;
  qrisImageUrl?: string | null;
  bankTransferEnabled?: boolean;
  bankAccounts?: BankAccount[];
}

export async function updatePaymentConfig(input: UpdatePaymentConfigInput) {
  const store = await requireActiveStore();
  const { DEFAULT_PAYMENT_CONFIG } = await import("@workspace/db/schema");
  const current = store.paymentConfig ?? DEFAULT_PAYMENT_CONFIG;

  // Validate bank accounts
  const bankAccounts = input.bankAccounts ?? current.bankAccounts;
  for (const acct of bankAccounts) {
    if (!acct.bank?.trim()) throw new AppError("VALIDATION_ERROR", "Nama bank wajib diisi");
    if (!acct.accountNumber?.trim()) throw new AppError("VALIDATION_ERROR", "Nomor rekening wajib diisi");
    if (!acct.accountName?.trim()) throw new AppError("VALIDATION_ERROR", "Nama pemilik rekening wajib diisi");
  }

  // At least one method must be enabled
  const qrisEnabled = input.qrisEnabled ?? current.qrisEnabled;
  const bankTransferEnabled = input.bankTransferEnabled ?? current.bankTransferEnabled;
  if (!qrisEnabled && !bankTransferEnabled) {
    throw new AppError("VALIDATION_ERROR", "Minimal satu metode pembayaran harus aktif");
  }

  // Bank transfer requires at least one account
  if (bankTransferEnabled && bankAccounts.length === 0) {
    throw new AppError("VALIDATION_ERROR", "Transfer Bank harus memiliki minimal satu rekening tujuan");
  }

  const next: PaymentConfig = {
    qrisEnabled,
    qrisImageUrl: input.qrisImageUrl !== undefined ? input.qrisImageUrl : current.qrisImageUrl,
    bankTransferEnabled,
    bankAccounts,
  };

  await db
    .update(storesTable)
    .set({ paymentConfig: next, updatedAt: new Date() })
    .where(eq(storesTable.id, store.id));

  return next;
}
