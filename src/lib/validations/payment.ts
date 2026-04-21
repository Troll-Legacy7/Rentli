import { z } from "zod";

export const logPaymentSchema = z.object({
  unitId: z.string().min(1, "Unit is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  method: z.string().min(1, "Payment method is required"),
  referenceNote: z.string().max(500).optional(),
  paidOn: z.coerce.date(),
});
