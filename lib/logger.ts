/**
 * Structured server-side logger. Emits one JSON line per event so logs stay
 * greppable. Never pass raw request URLs or credential values in `detail`;
 * callers are responsible for redacting before logging (see
 * lib/woocommerce/client.ts for the canonical example).
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  event: string;
  status?: number;
  code?: string;
  durationMs?: number;
  path?: string;
  message?: string;
}

function emit(entry: LogEntry): void {
  const line = JSON.stringify({ ...entry, timestamp: new Date().toISOString() });
  if (entry.level === 'error') {
    console.error(line);
  } else if (entry.level === 'warn') {
    console.warn(line);
  } else {
    console.info(line);
  }
}

export const logger = {
  info: (entry: Omit<LogEntry, 'level'>): void => emit({ level: 'info', ...entry }),
  warn: (entry: Omit<LogEntry, 'level'>): void => emit({ level: 'warn', ...entry }),
  error: (entry: Omit<LogEntry, 'level'>): void => emit({ level: 'error', ...entry }),
};

/** Strips credential-bearing query params from a URL before it is logged. */
export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('consumer_key');
    parsed.searchParams.delete('consumer_secret');
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return '[unparseable-url]';
  }
}
