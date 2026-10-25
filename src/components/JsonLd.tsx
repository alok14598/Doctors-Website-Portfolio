/**
 * Renders a structured-data block. The payload is built server-side from our
 * own database rows, never from user input, so serialising it into a script
 * tag is safe — `<` is still escaped to close off the one injection route a
 * future careless caller could open.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
