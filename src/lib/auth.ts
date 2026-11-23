import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await compare(password, user.passwordHash))) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.userId = user.id;
      const id = String(token.userId ?? token.sub ?? "");
      if (id) {
        const current = await prisma.user.findUnique({ where: { id }, select: { role: true, name: true, email: true } });
        if (current) {
          token.role = current.role;
          token.name = current.name;
          token.email = current.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId ?? token.sub ?? "");
        session.user.role = (token.role as "CUSTOMER" | "SELLER" | "ADMIN") ?? "CUSTOMER";
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
