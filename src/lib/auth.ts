import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "otp",
      name: "OTP",
      credentials: {
        phoneOrEmail: { label: "Phone or Email", type: "text" },
        code: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        const phoneOrEmail = credentials?.phoneOrEmail as string;
        if (!phoneOrEmail) return null;

        const user = await db.user.findUnique({
          where: { phoneOrEmail },
        });

        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.phoneOrEmail,
          role: user.role,
          plan: user.plan,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.plan = (user as { plan: string }).plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
        (session.user as { plan: string }).plan = token.plan as string;
      }
      return session;
    },
  },
});
