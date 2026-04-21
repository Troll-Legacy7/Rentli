import { auth } from "./auth";
import { redirect } from "next/navigation";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as SessionUser;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");
  return user;
}

export async function requireRole(role: "LANDLORD" | "TENANT"): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== role) {
    redirect(user.role === "LANDLORD" ? "/landlord" : "/tenant");
  }
  return user;
}
