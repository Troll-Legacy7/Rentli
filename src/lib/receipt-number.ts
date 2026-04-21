import { db } from "./db";

export async function generateReceiptNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

  const count = await db.receipt.count({
    where: {
      createdAt: {
        gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      },
    },
  });

  const seq = String(count + 1).padStart(4, "0");
  return `RNT-${dateStr}-${seq}`;
}
