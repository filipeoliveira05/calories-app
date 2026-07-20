"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(login, undefined);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-xs flex-col gap-3"
    >
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Password</label>
        <input
          name="password"
          type="password"
          autoFocus
          required
          className="rounded border border-zinc-300 bg-transparent px-2 py-1.5 text-sm dark:border-zinc-700"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        Sign in
      </button>
      {state?.error && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
