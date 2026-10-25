import type { Testimonial } from '@prisma/client';
import { Card } from '@/components/ui/Card';

const MAX_RATING = 5;

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="flex h-full flex-col p-7">
      <p
        className="text-warning-600 text-sm"
        aria-label={`Rated ${testimonial.rating} out of ${MAX_RATING}`}
      >
        <span aria-hidden="true">
          {'★'.repeat(testimonial.rating)}
          <span className="text-border-strong">{'★'.repeat(MAX_RATING - testimonial.rating)}</span>
        </span>
      </p>
      <blockquote className="text-ink-900 mt-5 flex-1 text-[1.0625rem] leading-[1.6] tracking-[-0.015em]">
        “{testimonial.quote}”
      </blockquote>
      <footer className="border-border mt-5 border-t pt-4 text-sm">
        <span className="text-ink-900 font-medium">{testimonial.patientName}</span>
        {testimonial.treatment ? (
          <span className="text-ink-400"> · {testimonial.treatment}</span>
        ) : null}
      </footer>
    </Card>
  );
}
