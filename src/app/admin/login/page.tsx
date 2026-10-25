import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/layout/Container';
import { auth } from '@/lib/auth';
import { LoginForm } from './LoginForm';

export const metadata = {
  title: 'Staff sign in',
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const [{ next }, session] = await Promise.all([searchParams, auth()]);

  // Already signed in — no reason to show the form again.
  if (session?.user?.id) redirect('/admin/appointments');

  return (
    <main id="main" className="flex flex-1 items-center">
      <Container width="narrow" className="py-20">
        <div className="mx-auto max-w-md">
          <p className="text-accent-700 text-center text-xs font-semibold tracking-[0.14em] uppercase">
            Staff area
          </p>
          <h1 className="mt-3 text-center text-3xl">Sign in</h1>
          <p className="mt-3 text-center text-sm">
            For clinic staff only. Patients can{' '}
            <Link href="/appointment" className="text-accent-700 font-medium hover:underline">
              request an appointment here
            </Link>
            .
          </p>

          <Card className="mt-8 p-6 sm:p-8">
            <LoginForm next={next} />
          </Card>

          <p className="text-ink-400 mt-6 text-center text-xs">
            Accounts are created by the clinic administrator. There is no self-service signup.
          </p>
        </div>
      </Container>
    </main>
  );
}
