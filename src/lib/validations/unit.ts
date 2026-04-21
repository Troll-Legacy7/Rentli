import { z } from "zod";

export const createUnitSchema = z.object({
  label: z.string().min(1, "Unit label is required").max(100),
  rentOverride: z.coerce.number().min(0).nullable().optional(),
});

export const updateUnitSchema = createUnitSchema.partial();
