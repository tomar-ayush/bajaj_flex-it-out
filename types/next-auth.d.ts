import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      points: number;
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    points: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    points?: number;
  }
}
