"use client";

import { useActionState, useState } from "react";
import { login } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(login, undefined);
  const [dismissedError, setDismissedError] = useState<string | null>(null);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-xs flex-col gap-3 rounded-2xl bg-surface-raised p-4 shadow-sm"
    >
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink-muted">Password</label>
        <input
          name="password"
          type="password"
          autoFocus
          required
          className="rounded-xl border border-hairline bg-bg px-3 py-2.5 text-sm text-ink focus:border-sage focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-sage px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        Sign in
      </button>
      {state?.error && state.error !== dismissedError && (
        <p className="flex items-start gap-1.5 text-xs text-danger">
          <span className="whitespace-pre-line">{state.error}</span>
          <button
            type="button"
            onClick={() => setDismissedError(state.error ?? null)}
            aria-label="Dismiss"
            className="shrink-0 font-medium text-danger hover:opacity-70"
          >
            ×
          </button>
        </p>
      )}
    </form>
  );
}
