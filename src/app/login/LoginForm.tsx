"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(login, undefined);

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
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}
