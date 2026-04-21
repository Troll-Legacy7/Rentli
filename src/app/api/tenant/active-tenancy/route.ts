import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await requireRole("TENANT");

    const tenancy = await db.tenancy.findFirst({
      where: { tenantId: user.id, status: "ACTIVE" },
      include: { property: true, unit: true },
    });

    if (!tenancy) {
      return NextResponse.json({});
    }

    return NextResponse.json({
      unitId: tenancy.unitId,
      unitLabel: tenancy.unit.label,
      propertyLabel: tenancy.property.label,
      monthlyRent: tenancy.monthlyRent,
      currency: tenancy.currency,
    });
  } catch {
    return NextResponse.json({}, { status: 401 });
  }
}
