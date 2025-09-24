export default function AboutPage() {
  return (
    <main className="prose max-w-3xl">
      <h1>About</h1>
      <p>
        Product Data Explorer lets you browse headings → categories → products
        scraped on-demand from World of Books with a safe queue, caching and TTL refresh.
      </p>
      <ul>
        <li>Frontend: Next.js App Router + React Query + Tailwind</li>
        <li>Backend: NestJS + Prisma + Postgres + BullMQ</li>
      </ul>
    </main>
  );
}
