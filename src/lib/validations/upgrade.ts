import { z } from "zod";

export const upgradeRequestSchema = z.object({
  referenceText: z.string().min(1, "Payment reference is required").max(500),
  note: z.string().max(1000).optional(),
});
