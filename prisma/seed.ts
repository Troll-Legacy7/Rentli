import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.receipt.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.tenancy.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.property.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.upgradeRequest.deleteMany();
  await prisma.user.deleteMany();

  // Create landlord
  const landlord = await prisma.user.create({
    data: {
      name: "Mwamba Chikwanda",
      phoneOrEmail: "landlord@rentli.test",
      role: "LANDLORD",
      plan: "FREE",
      themePreference: "DARK",
    },
  });

  // Create tenants
  const tenant1 = await prisma.user.create({
    data: {
      name: "Grace Banda",
      phoneOrEmail: "grace@rentli.test",
      role: "TENANT",
      themePreference: "DARK",
    },
  });

  const tenant2 = await prisma.user.create({
    data: {
      name: "Joseph Mulenga",
      phoneOrEmail: "joseph@rentli.test",
      role: "TENANT",
      themePreference: "DARK",
    },
  });

  const tenant3 = await prisma.user.create({
    data: {
      name: "Natasha Phiri",
      phoneOrEmail: "natasha@rentli.test",
      role: "TENANT",
      themePreference: "DARK",
    },
  });

  // Create property
  const property = await prisma.property.create({
    data: {
      landlordId: landlord.id,
      label: "Plot 52 Boarding House",
      area: "Woodlands, Lusaka",
      defaultRent: 1500,
      dueDay: 1,
      currency: "ZMW",
    },
  });

  // Create units
  const unit1 = await prisma.unit.create({
    data: {
      propertyId: property.id,
      label: "Room 1",
      occupancyStatus: "OCCUPIED",
    },
  });

  const unit2 = await prisma.unit.create({
    data: {
      propertyId: property.id,
      label: "Room 2",
      occupancyStatus: "OCCUPIED",
      rentOverride: 1800,
    },
  });

  const unit3 = await prisma.unit.create({
    data: {
      propertyId: property.id,
      label: "Room 3",
      occupancyStatus: "VACANT",
    },
  });

  const unit4 = await prisma.unit.create({
    data: {
      propertyId: property.id,
      label: "Room 4",
      occupancyStatus: "OCCUPIED",
    },
  });

  // Create tenancies
  const now = new Date();
  const leaseStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const leaseEnd = new Date(now.getFullYear(), now.getMonth() + 9, 1);

  await prisma.tenancy.create({
    data: {
      tenantId: tenant1.id,
      landlordId: landlord.id,
      propertyId: property.id,
      unitId: unit1.id,
      leaseStart,
      leaseEnd,
      monthlyRent: 1500,
      dueDay: 1,
      currency: "ZMW",
      balanceOwing: 0,
      status: "ACTIVE",
    },
  });

  await prisma.tenancy.create({
    data: {
      tenantId: tenant2.id,
      landlordId: landlord.id,
      propertyId: property.id,
      unitId: unit2.id,
      leaseStart,
      leaseEnd,
      monthlyRent: 1800,
      dueDay: 1,
      currency: "ZMW",
      balanceOwing: 1800,
      status: "ACTIVE",
    },
  });

  await prisma.tenancy.create({
    data: {
      tenantId: tenant3.id,
      landlordId: landlord.id,
      propertyId: property.id,
      unitId: unit4.id,
      leaseStart,
      leaseEnd,
      monthlyRent: 1500,
      dueDay: 1,
      currency: "ZMW",
      balanceOwing: 3000,
      status: "ACTIVE",
    },
  });

  // Create payments
  const months = [2, 1, 0]; // 3 months of payments
  for (const monthsAgo of months) {
    const paidOn = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 3);

    // Grace pays on time
    const p1 = await prisma.payment.create({
      data: {
        tenantId: tenant1.id,
        landlordId: landlord.id,
        propertyId: property.id,
        unitId: unit1.id,
        amount: 1500,
        currency: "ZMW",
        method: "Mobile Money",
        paidOn,
        status: "CONFIRMED",
      },
    });
    await prisma.receipt.create({
      data: {
        paymentId: p1.id,
        receiptNumber: `RNT-${paidOn.toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
        status: "CONFIRMED",
        confirmedAt: new Date(paidOn.getTime() + 86400000),
      },
    });

    // Joseph pays (except current month)
    if (monthsAgo > 0) {
      const p2 = await prisma.payment.create({
        data: {
          tenantId: tenant2.id,
          landlordId: landlord.id,
          propertyId: property.id,
          unitId: unit2.id,
          amount: 1800,
          currency: "ZMW",
          method: "Bank Transfer",
          paidOn,
          status: "CONFIRMED",
        },
      });
      await prisma.receipt.create({
        data: {
          paymentId: p2.id,
          receiptNumber: `RNT-${paidOn.toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
          status: "CONFIRMED",
          confirmedAt: new Date(paidOn.getTime() + 86400000),
        },
      });
    }
  }

  // Natasha has a pending payment
  await prisma.payment.create({
    data: {
      tenantId: tenant3.id,
      landlordId: landlord.id,
      propertyId: property.id,
      unitId: unit4.id,
      amount: 1500,
      currency: "ZMW",
      method: "Cash",
      paidOn: new Date(now.getFullYear(), now.getMonth(), 5),
      status: "PENDING",
    },
  });

  console.log("Seed complete!");
  console.log(`  Landlord: ${landlord.phoneOrEmail}`);
  console.log(`  Tenants: ${tenant1.phoneOrEmail}, ${tenant2.phoneOrEmail}, ${tenant3.phoneOrEmail}`);
  console.log(`  Property: ${property.label} (4 units)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
