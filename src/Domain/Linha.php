<?php

declare(strict_types=1);

namespace App\Domain;

/**
 * Linha de ônibus (dados da LISTAGEM).
 *
 * `semob` indica o sistema Semob/DFTrans — as únicas linhas com rastreamento
 * por GPS. Na listagem é inferido pelo padrão do slug (linhas ANTT do Entorno
 * não são Semob); no detalhe é confirmado pelo bloco `semob_extra`.
 */
class Linha
{
    public function __construct(
        public readonly string $id,
        public readonly string $numero,
        public readonly string $nome,
        public readonly string $slug,
        public readonly ?string $origem = null,
        public readonly ?string $destino = null,
        public readonly ?string $cidadeSlug = null,
        public readonly ?string $cidadeNome = null,
        public readonly ?string $operadora = null,
        public readonly bool $semob = true,
    ) {
    }

    /**
     * Título de exibição sem a redundância comum na API, onde o `nome` já
     * começa com o número (ex.: "0.111" + "0.111 Rodoviária…").
     */
    public function titulo(): string
    {
        $nome = trim($this->nome);

        if ($this->numero !== '') {
            $escapado = preg_quote($this->numero, '/');
            $nome = trim((string) preg_replace('/^' . $escapado . '\s*[-–—:\/]?\s*/u', '', $nome));
        }

        if ($this->numero !== '' && $nome !== '') {
            return 'Linha ' . $this->numero . ' — ' . $nome;
        }

        return $this->numero !== '' ? 'Linha ' . $this->numero : ($nome !== '' ? $nome : 'Linha');
    }

    /** "Origem → Destino", quando houver. */
    public function trajeto(): ?string
    {
        $partes = array_values(array_filter([$this->origem, $this->destino]));

        return $partes === [] ? null : implode(' → ', $partes);
    }

    /** Subtítulo do card: trajeto ou, na falta dele, a cidade. */
    public function subtitulo(): ?string
    {
        return $this->trajeto() ?? $this->cidadeNome;
    }

    /**
     * Representação para o JS (busca client-side e favoritos).
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'slug' => $this->slug,
            'numero' => $this->numero,
            'nome' => $this->nome,
            'origem' => $this->origem,
            'destino' => $this->destino,
            'cidadeNome' => $this->cidadeNome,
            'semob' => $this->semob,
        ];
    }
}
