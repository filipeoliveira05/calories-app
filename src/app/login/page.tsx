import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16">
      <h1 className="mb-1 font-display text-3xl font-semibold">Calories Tracker</h1>
      <p className="mb-6 text-sm text-ink-muted">Your food, weight, and progress log.</p>
      <LoginForm next={next && next.startsWith("/") ? next : "/"} />
    </div>
  );
}
