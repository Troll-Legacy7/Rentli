import { z } from "zod";

export const loginSchema = z.object({
  phoneOrEmail: z
    .string()
    .min(1, "Phone number or email is required")
    .refine(
      (val) => val.includes("@") || /^\+?\d{9,15}$/.test(val.replace(/\s/g, "")),
      "Enter a valid phone number or email address"
    ),
  role: z.enum(["LANDLORD", "TENANT"]),
  name: z.string().optional(),
});

export const verifyOtpSchema = z.object({
  phoneOrEmail: z.string().min(1),
  code: z.string().length(6, "OTP must be 6 digits"),
});
