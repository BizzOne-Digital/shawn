import type { NextAuthConfig } from "next-auth";
import type { MemberType, UserRole } from "@prisma/client";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: UserRole }).role;
        token.memberType = (user as { memberType?: MemberType }).memberType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.memberType = token.memberType as MemberType;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
