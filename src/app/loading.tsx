/** Skeleton de carregamento exibido durante o streaming dos Server Components. */
export default function Loading() {
  return (
    <div className="container-page py-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando…</span>
      <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-slate-200"
          />
        ))}
      </div>
    </div>
  );
}
