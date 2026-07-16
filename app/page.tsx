import { getPublicEnv } from '@/lib/env';

export default function HomePage(): React.ReactElement {
  const { storeName } = getPublicEnv();
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-bold">{storeName}</h1>
      <p className="mt-2 text-fg-muted">Product listing coming in Phase 2.</p>
    </div>
  );
}
