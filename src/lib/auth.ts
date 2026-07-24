import bcrypt from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/server/services/audit-service";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/admin/login"
  },
  providers: [
    CredentialsProvider({
      name: "Admin credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const admin = await prisma.adminUser.findUnique({
          where: { email: credentials.email }
        });

        if (!admin) {
          return null;
        }

        const matches = await bcrypt.compare(credentials.password, admin.passwordHash);

        if (!matches) {
          return null;
        }

        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() }
        });

        await createAuditLog({
          adminUserId: admin.id,
          action: "ADMIN_LOGIN",
          entityType: "AdminUser",
          entityId: admin.id,
          metadata: { email: admin.email }
        });

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    }
  }
};

export async function auth() {
  return getServerSession(authOptions);
}

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  return session;
}
