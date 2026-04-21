import { z } from "zod";

export const createDisputeSchema = z.object({
  unitId: z.string().min(1, "Unit is required"),
  paymentId: z.string().optional(),
  receiptId: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
});

export const resolveDisputeSchema = z.object({
  disputeId: z.string().min(1),
  resolutionNote: z.string().min(1, "Resolution note is required").max(2000),
  status: z.enum(["RESOLVED", "CLOSED"]),
});
