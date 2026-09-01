import { UserRole, MemberType } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      memberType?: MemberType;
    };
  }

  interface User {
    role: UserRole;
    memberType?: MemberType;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    memberType?: MemberType;
  }
}
