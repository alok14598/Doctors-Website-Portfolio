import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { AppError } from '@/lib/errors';
import { signInSchema } from '@/lib/schemas/auth';
import { findByEmail } from '@/server/repositories/admin.repository';

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: 'OWNER' | 'STAFF' } & DefaultSession['user'];
  }

  interface User {
    role: 'OWNER' | 'STAFF';
  }
}

/**
 * Credentials auth with a JWT session cookie. There is no self-service signup —
 * staff accounts are created by the seed, so there is no registration surface
 * to attack.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  pages: { signIn: '/admin/login' },
  trustHost: true,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await findByEmail(parsed.data.email);

        // Compare even when the user is unknown, so a missing account and a
        // wrong password take the same time and cannot be told apart.
        const hash = user?.passwordHash ?? '$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinv';
        const matches = await bcrypt.compare(parsed.data.password, hash);

        if (!user || !matches) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.sub ?? '';
      session.user.role = (token.role as 'OWNER' | 'STAFF') ?? 'STAFF';
      return session;
    },
  },
});

/**
 * Guard for every admin Server Action. The middleware already blocks admin
 * *pages*, but a Server Action is a POST endpoint of its own — it must check
 * for itself rather than trust that the caller came from a guarded page.
 */
export const requireStaff = async (): Promise<{ id: string; role: 'OWNER' | 'STAFF' }> => {
  const session = await auth();
  if (!session?.user?.id) throw AppError.unauthorized();

  return { id: session.user.id, role: session.user.role };
};
