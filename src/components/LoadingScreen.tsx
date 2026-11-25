export function LoadingScreen({ message = "Cargando…" }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-sm text-stone-500">
        <span
          className="size-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-700"
          aria-hidden="true"
        />
        {message}
      </div>
    </div>
  );
}
