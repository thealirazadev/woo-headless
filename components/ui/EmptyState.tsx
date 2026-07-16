import type { ReactElement, ReactNode } from 'react';

interface EmptyStateProps {
  heading: string;
  message: string;
  action?: ReactNode;
}

/** Shared empty-state card: icon, heading, one line of guidance, and an optional action. */
export function EmptyState({ heading, message, action }: EmptyStateProps): ReactElement {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface px-6 py-16 text-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-10 w-10 text-fg-muted"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7h18M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"
        />
      </svg>
      <h2 className="text-lg font-semibold text-fg">{heading}</h2>
      <p className="text-sm text-fg-muted">{message}</p>
      {action}
    </div>
  );
}
