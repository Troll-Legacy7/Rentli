import { z } from "zod";

export const createInviteSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  unitId: z.string().optional(),
});
