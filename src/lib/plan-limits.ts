import { db } from "./db";

export const PLAN_LIMITS = {
  FREE: { properties: 1, units: 5, tenants: 5, disputes: false, advancedDashboard: false },
  PRO: { properties: Infinity, units: Infinity, tenants: Infinity, disputes: true, advancedDashboard: true },
} as const;

type PlanResource = "properties" | "units" | "tenants";

export async function checkPlanLimit(
  landlordId: string,
  resource: PlanResource
): Promise<{ allowed: boolean; message?: string }> {
  const user = await db.user.findUnique({ where: { id: landlordId }, select: { plan: true } });
  if (!user) return { allowed: false, message: "User not found" };

  const limits = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.FREE;
  const limit = limits[resource];

  if (limit === Infinity) return { allowed: true };

  let count = 0;
  switch (resource) {
    case "properties":
      count = await db.property.count({ where: { landlordId } });
      break;
    case "units":
      count = await db.unit.count({
        where: { property: { landlordId } },
      });
      break;
    case "tenants":
      count = await db.tenancy.count({
        where: { landlordId, status: "ACTIVE" },
      });
      break;
  }

  if (count >= limit) {
    return {
      allowed: false,
      message: `Free plan limit reached: ${limit} ${resource}. Upgrade to Pro for more.`,
    };
  }

  return { allowed: true };
}
