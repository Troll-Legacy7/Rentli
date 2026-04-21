"use server";

import { db } from "@/lib/db";
import { createOtp, verifyOtp as verifyOtpCode } from "@/lib/otp";
import { signIn } from "@/lib/auth";
import { loginSchema, verifyOtpSchema } from "@/lib/validations/auth";
import { sendWhatsApp } from "@/lib/whatsapp";

export type AuthResult = {
  success: boolean;
  error?: string;
  otp?: string; // dev-mode: display OTP on screen
  phoneOrEmail?: string;
  role?: string;
};

export async function requestOtp(formData: FormData): Promise<AuthResult> {
  const raw = {
    phoneOrEmail: formData.get("phoneOrEmail") as string,
    role: formData.get("role") as string,
    name: formData.get("name") as string | undefined,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { phoneOrEmail, role, name } = parsed.data;

  // Find or create user
  let user = await db.user.findUnique({ where: { phoneOrEmail } });

  if (!user) {
    // New user — create account
    user = await db.user.create({
      data: {
        phoneOrEmail,
        role,
        name: name || phoneOrEmail,
      },
    });
  } else if (user.role !== role) {
    return {
      success: false,
      error: `This account is registered as a ${user.role.toLowerCase()}. Please select the correct role.`,
    };
  }

  // Generate OTP
  const code = await createOtp(phoneOrEmail);

  // Send OTP via WhatsApp (fire-and-forget — never blocks the response)
  void sendWhatsApp({
    recipientId: user.id,
    phoneOrEmail,
    event: "OTP_SENT",
    templateName: "rentli_otp",
    params: [code],
  });

  return {
    success: true,
    // Only expose OTP in development so users can see it on-screen
    otp: process.env.NODE_ENV === "production" ? undefined : code,
    phoneOrEmail,
    role: user.role,
  };
}

export async function verifyOtp(formData: FormData): Promise<AuthResult> {
  const raw = {
    phoneOrEmail: formData.get("phoneOrEmail") as string,
    code: formData.get("code") as string,
  };

  const parsed = verifyOtpSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { phoneOrEmail, code } = parsed.data;

  const valid = await verifyOtpCode(phoneOrEmail, code);
  if (!valid) {
    return { success: false, error: "Invalid or expired OTP code" };
  }

  // Sign in with next-auth
  try {
    await signIn("otp", {
      phoneOrEmail,
      code,
      redirect: false,
    });
    return { success: true, phoneOrEmail };
  } catch {
    return { success: false, error: "Authentication failed. Please try again." };
  }
}
