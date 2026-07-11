"use client";

import { alternarFavorito, useEhFavorito } from "@/lib/favorites";

interface FavoriteToggleProps {
  /** Slug da linha (identificador persistido). */
  slug: string;
  /** Número da linha, usado apenas no aria-label. */
  numero?: string;
  /** Exibe um rótulo textual ao lado da estrela (ex.: na página de detalhe). */
  showLabel?: boolean;
  className?: string;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      aria-hidden="true"
    >
      <path
        strokeLinejoin="round"
        d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
      />
    </svg>
  );
}

/**
 * Botão de alternância (estrela) para adicionar/remover uma linha dos
 * favoritos. Estrela preenchida (âmbar) = favorito; contorno = não favorito.
 *
 * `preventDefault`/`stopPropagation` no clique permitem usá-lo por cima de um
 * card que é um link, sem disparar a navegação.
 */
export function FavoriteToggle({
  slug,
  numero,
  showLabel = false,
  className = "",
}: FavoriteToggleProps) {
  const ativo = useEhFavorito(slug);
  const alvo = numero ? `linha ${numero}` : "linha";
  const label = ativo
    ? `Remover ${alvo} dos favoritos`
    : `Adicionar ${alvo} aos favoritos`;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        alternarFavorito(slug);
      }}
      aria-pressed={ativo}
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-1.5 rounded-lg transition ${
        ativo
          ? "text-accent-500"
          : "text-slate-400 hover:text-accent-500"
      } ${
        showLabel
          ? "border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-accent-400"
          : "p-1.5 hover:bg-slate-100"
      } ${className}`}
    >
      <StarIcon filled={ativo} />
      {showLabel && (
        <span className={ativo ? "text-accent-600" : "text-slate-700"}>
          {ativo ? "Favorito" : "Favoritar"}
        </span>
      )}
    </button>
  );
}
