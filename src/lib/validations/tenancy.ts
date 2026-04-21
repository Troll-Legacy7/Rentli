import { z } from "zod";

export const createTenancySchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  propertyId: z.string().min(1, "Property is required"),
  unitId: z.string().min(1, "Unit is required"),
  leaseStart: z.coerce.date(),
  leaseEnd: z.coerce.date(),
  monthlyRent: z.coerce.number().min(0, "Rent must be 0 or greater"),
  dueDay: z.coerce.number().int().min(1).max(31).default(1),
  currency: z.string().default("ZMW"),
});

export const endTenancySchema = z.object({
  tenancyId: z.string().min(1),
});
