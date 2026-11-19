"use client";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  return (
    <main>
      <h2>Ocurrió un error inesperado</h2>
      <p>{error.message}</p>
      <button type="button" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}
