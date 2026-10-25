import { Button } from '@/components/ui/Button';
import { signOut } from '@/lib/auth';

/**
 * A form POST rather than a link, so signing out cannot happen from a GET — a
 * prefetch or an image tag would otherwise be able to log staff out.
 */
export function SignOutButton() {
  return (
    <form
      action={async () => {
        'use server';
        await signOut({ redirectTo: '/admin/login' });
      }}
    >
      <Button type="submit" variant="secondary" size="sm">
        Sign out
      </Button>
    </form>
  );
}
