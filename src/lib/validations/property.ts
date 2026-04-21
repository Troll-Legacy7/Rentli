import { z } from "zod";

export const createPropertySchema = z.object({
  label: z.string().min(1, "Property name is required").max(100),
  area: z.string().max(200).default(""),
  defaultRent: z.coerce.number().min(0, "Rent must be 0 or greater"),
  dueDay: z.coerce.number().int().min(1).max(31).default(1),
  currency: z.string().default("ZMW"),
});

export const updatePropertySchema = createPropertySchema.partial();
