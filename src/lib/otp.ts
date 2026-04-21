import { db } from "./db";

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOtp(identifier: string): Promise<string> {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.otpCode.create({
    data: { identifier, code, expiresAt },
  });

  return code;
}

export async function verifyOtp(identifier: string, code: string): Promise<boolean> {
  const otp = await db.otpCode.findFirst({
    where: {
      identifier,
      code,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return false;

  await db.otpCode.update({
    where: { id: otp.id },
    data: { usedAt: new Date() },
  });

  return true;
}
