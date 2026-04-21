import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await requireRole("LANDLORD");

    const properties = await db.property.findMany({
      where: { landlordId: user.id },
      select: {
        id: true,
        label: true,
        units: {
          select: { id: true, label: true, occupancyStatus: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(properties);
  } catch {
    return NextResponse.json([], { status: 401 });
  }
}
