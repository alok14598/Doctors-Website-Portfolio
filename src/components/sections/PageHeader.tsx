import { Container } from '@/components/layout/Container';
import { Pill } from '@/components/ui/Pill';

export function PageHeader({
  eyebrow,
  title,
  titleAccent,
  description,
}: {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  description?: string;
}) {
  return (
    <div className="bg-surface-2 relative overflow-hidden py-16 sm:py-20">
      <Container>
        {eyebrow ? (
          <div className="mb-5 flex">
            <Pill tone="white">{eyebrow}</Pill>
          </div>
        ) : null}

        <h1 className="max-w-3xl text-[2.25rem] sm:text-5xl">
          {title}
          {titleAccent ? (
            <>
              {' '}
              <span className="heading-accent">{titleAccent}</span>
            </>
          ) : null}
        </h1>

        {description ? (
          <p className="text-ink-600 mt-6 max-w-2xl text-[17px] leading-[1.7]">{description}</p>
        ) : null}
      </Container>
    </div>
  );
}
