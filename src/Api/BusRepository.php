<?php

declare(strict_types=1);

namespace App\Api;

use App\Domain\Cidade;
use App\Domain\Horario;
use App\Domain\Linha;
use App\Domain\LinhaDetalhe;
use App\Domain\Percurso;
use App\Domain\Sentido;
use App\Support\Slug;

/**
 * Anti-corruption layer: traduz o payload bruto da API (arrays soltos, com
 * nomes de campos variáveis) para as entidades TIPADAS do domínio.
 *
 * Toda a tolerância a variações de formato mora aqui — o resto da aplicação
 * só enxerga objetos bem definidos.
 */
final class BusRepository
{
    private const LABEL_TIPO_DIA = [
        'util' => 'Dias úteis',
        'uteis' => 'Dias úteis',
        'sabado' => 'Sábado',
        'domingo' => 'Domingo e feriados',
        'feriado' => 'Feriados',
    ];

    private const LABEL_SENTIDO = ['ida' => 'Ida', 'volta' => 'Volta'];

    public function __construct(private readonly BusApiClient $api)
    {
    }

    // ------------------------------------------------------------------
    //  Consultas
    // ------------------------------------------------------------------

    /** @return list<Cidade> */
    public function cidades(): array
    {
        $cidades = array_map($this->mapCidade(...), $this->api->cidades());

        usort($cidades, static fn (Cidade $a, Cidade $b): int
            => strcoll($a->nome, $b->nome));

        return $cidades;
    }

    public function cidade(string $slug): ?Cidade
    {
        foreach ($this->cidades() as $cidade) {
            if ($cidade->slug === $slug) {
                return $cidade;
            }
        }

        return null;
    }

    /**
     * Lista as linhas. Com $cidadeSlug, filtra por cidade no servidor e,
     * como fallback (se a API ignorar o parâmetro), também no cliente.
     *
     * @return list<Linha>
     */
    public function linhas(?string $cidadeSlug = null): array
    {
        $query = $cidadeSlug !== null && $cidadeSlug !== '' ? ['cidade' => $cidadeSlug] : [];
        $linhas = array_map($this->mapLinha(...), $this->api->linhas($query));

        if ($cidadeSlug !== null && $cidadeSlug !== '') {
            $filtradas = array_values(array_filter(
                $linhas,
                static fn (Linha $l): bool => $l->cidadeSlug === $cidadeSlug,
            ));

            if ($filtradas !== []) {
                $linhas = $filtradas;
            }
        }

        usort($linhas, static fn (Linha $a, Linha $b): int
            => strnatcasecmp($a->numero, $b->numero));

        return $linhas;
    }

    public function detalhe(string $slug): ?LinhaDetalhe
    {
        $raw = $this->api->linha($slug);

        return $raw === null ? null : $this->mapDetalhe($raw);
    }

    // ------------------------------------------------------------------
    //  Mapeadores
    // ------------------------------------------------------------------

    /** @param array<mixed> $raw */
    private function mapCidade(array $raw): Cidade
    {
        $nome = (string) ($raw['nome'] ?? $raw['name'] ?? 'Cidade');
        // Preserva o slug da API; só gera um quando ausente.
        $slug = trim((string) ($raw['slug'] ?? '')) ?: Slug::from($nome);
        $total = $raw['totalLinhas'] ?? $raw['total_linhas'] ?? null;

        return new Cidade(
            id: (string) ($raw['id'] ?? $raw['_id'] ?? $slug),
            nome: $nome,
            slug: $slug,
            uf: isset($raw['uf']) ? (string) $raw['uf'] : (isset($raw['estado']) ? (string) $raw['estado'] : null),
            totalLinhas: is_numeric($total) ? (int) $total : null,
        );
    }

    /**
     * Slug com prefixo "ANTT-" ⇒ linha interestadual do Entorno (sem GPS).
     * As demais são do sistema Semob/DFTrans.
     */
    private function ehSemob(string $slug): bool
    {
        return preg_match('/^antt[-_]/i', $slug) !== 1;
    }

    /** @param array<mixed> $raw */
    private function mapLinha(array $raw): Linha
    {
        $numero = (string) ($raw['numero'] ?? $raw['number'] ?? $raw['codigo'] ?? '');
        $nome = (string) ($raw['nome'] ?? $raw['name'] ?? ($numero !== '' ? $numero : 'Linha'));
        $slug = trim((string) ($raw['slug'] ?? '')) ?: Slug::from(trim($numero . ' ' . $nome));

        return new Linha(
            id: (string) ($raw['id'] ?? $raw['_id'] ?? $slug),
            numero: $numero,
            nome: $nome,
            slug: $slug,
            origem: isset($raw['origem']) ? (string) $raw['origem'] : null,
            destino: isset($raw['destino']) ? (string) $raw['destino'] : null,
            cidadeSlug: isset($raw['cidadeSlug']) ? (string) $raw['cidadeSlug']
                : (isset($raw['cidade_slug']) ? (string) $raw['cidade_slug'] : null),
            cidadeNome: isset($raw['cidade_nome']) ? (string) $raw['cidade_nome']
                : (isset($raw['cidade']) ? (string) $raw['cidade']
                : (isset($raw['estado']) ? (string) $raw['estado'] : null)),
            operadora: isset($raw['operadora']) ? (string) $raw['operadora']
                : (isset($raw['empresa']) ? (string) $raw['empresa'] : null),
            semob: $this->ehSemob($slug),
        );
    }

    /** @param array<mixed> $raw */
    private function mapDetalhe(array $raw): LinhaDetalhe
    {
        $base = $this->mapLinha($raw);

        return new LinhaDetalhe(
            id: $base->id,
            numero: $base->numero,
            nome: $base->nome,
            slug: $base->slug,
            origem: $base->origem,
            destino: $base->destino,
            cidadeSlug: $base->cidadeSlug,
            cidadeNome: $base->cidadeNome,
            operadora: $base->operadora,
            // No detalhe, o bloco `semob_extra` é a confirmação autoritativa.
            semob: is_array($raw['semob_extra'] ?? null),
            sentidos: $this->mapSentidos($raw),
            percurso: $this->mapPercurso($raw),
            tarifa: isset($raw['tarifa']) ? (string) $raw['tarifa'] : null,
            informacoesAdicionais: isset($raw['informacoesAdicionais'])
                ? (string) $raw['informacoesAdicionais']
                : (isset($raw['informacoes_adicionais']) ? (string) $raw['informacoes_adicionais'] : null),
        );
    }

    /**
     * Combina `itinerarios` (objeto por sentido) com `horarios` (lista com
     * sentido/tipo_dia), descartando sentidos vazios e ordenando Ida → Volta.
     *
     * @param array<mixed> $raw
     * @return list<Sentido>
     */
    private function mapSentidos(array $raw): array
    {
        $itinerarios = is_array($raw['itinerarios'] ?? null) && !array_is_list($raw['itinerarios'])
            ? $raw['itinerarios']
            : [];
        $horarios = is_array($raw['horarios'] ?? null) ? $raw['horarios'] : [];

        $chaves = [];
        foreach (array_keys($itinerarios) as $chave) {
            $chaves[strtolower((string) $chave)] = true;
        }
        foreach ($horarios as $h) {
            if (is_array($h) && ($h['sentido'] ?? '') !== '') {
                $chaves[strtolower((string) $h['sentido'])] = true;
            }
        }

        $ordem = static fn (string $k): int => match ($k) {
            'ida' => 0,
            'volta' => 1,
            default => 2,
        };
        $chaves = array_keys($chaves);
        usort($chaves, static fn (string $a, string $b): int => $ordem($a) <=> $ordem($b));

        $sentidos = [];

        foreach ($chaves as $chave) {
            $itinerario = is_array($itinerarios[$chave] ?? null)
                ? array_values(array_map(strval(...), $itinerarios[$chave]))
                : [];

            $doSentido = [];
            foreach ($horarios as $h) {
                if (!is_array($h) || strtolower((string) ($h['sentido'] ?? '')) !== $chave) {
                    continue;
                }

                $saidas = $h['saidas'] ?? $h['horarios'] ?? [];
                if (!is_array($saidas) || $saidas === []) {
                    continue;
                }

                $doSentido[] = new Horario(
                    dia: (string) ($h['dia'] ?? $h['categoria'] ?? $this->labelDia($h['tipo_dia'] ?? null)),
                    saidas: array_values(array_map(strval(...), $saidas)),
                );
            }

            $sentido = new Sentido(
                nome: self::LABEL_SENTIDO[$chave] ?? ucfirst($chave),
                itinerario: $itinerario,
                horarios: $doSentido,
            );

            if (!$sentido->vazio()) {
                $sentidos[] = $sentido;
            }
        }

        return $sentidos !== [] ? $sentidos : $this->mapSentidoPlano($raw, $horarios);
    }

    /**
     * Fallback para payloads "planos" (sem estrutura por sentido).
     *
     * @param array<mixed> $raw
     * @param array<mixed> $horarios
     * @return list<Sentido>
     */
    private function mapSentidoPlano(array $raw, array $horarios): array
    {
        $itinerario = $raw['itinerario'] ?? $raw['paradas'] ?? [];
        $itinerario = is_array($itinerario) ? array_values(array_map(strval(...), $itinerario)) : [];

        $lista = [];
        foreach ($horarios as $h) {
            if (!is_array($h)) {
                continue;
            }

            $saidas = $h['saidas'] ?? $h['horarios'] ?? [];
            if (!is_array($saidas) || $saidas === []) {
                continue;
            }

            $lista[] = new Horario(
                dia: $this->labelDia($h['tipo_dia'] ?? null),
                saidas: array_values(array_map(strval(...), $saidas)),
            );
        }

        $sentido = new Sentido('Linha', $itinerario, $lista);

        return $sentido->vazio() ? [] : [$sentido];
    }

    private function labelDia(mixed $raw): string
    {
        if (!is_string($raw) || $raw === '') {
            return 'Horários';
        }

        return self::LABEL_TIPO_DIA[strtolower($raw)] ?? $raw;
    }

    /**
     * Normaliza uma coordenada para [lat, lng], validando as faixas
     * geográficas. Aceita tupla ou objeto com nomes variados.
     *
     * @return array{float,float}|null
     */
    private function mapCoordenada(mixed $raw): ?array
    {
        if (is_array($raw) && array_is_list($raw) && count($raw) >= 2) {
            [$lat, $lng] = $raw;
        } elseif (is_array($raw)) {
            $lat = $raw['lat'] ?? $raw['latitude'] ?? $raw['y'] ?? null;
            $lng = $raw['lng'] ?? $raw['lon'] ?? $raw['long'] ?? $raw['longitude'] ?? $raw['x'] ?? null;
        } else {
            return null;
        }

        if (!is_numeric($lat) || !is_numeric($lng)) {
            return null;
        }

        $lat = (float) $lat;
        $lng = (float) $lng;

        if ($lat < -90.0 || $lat > 90.0 || $lng < -180.0 || $lng > 180.0) {
            return null;
        }

        return [$lat, $lng];
    }

    /** @return list<array{float,float}> */
    private function mapCoordenadas(mixed $raw): array
    {
        if (!is_array($raw)) {
            return [];
        }

        $out = [];
        foreach ($raw as $item) {
            $coord = $this->mapCoordenada($item);
            if ($coord !== null) {
                $out[] = $coord;
            }
        }

        return $out;
    }

    /** @param array<mixed> $raw */
    private function mapPercurso(array $raw): ?Percurso
    {
        $src = $raw['percurso'] ?? $raw['trajeto'] ?? $raw['rota'] ?? null;

        if (!is_array($src) || array_is_list($src)) {
            return null;
        }

        $percurso = new Percurso(
            ida: $this->mapCoordenadas($src['ida'] ?? null),
            volta: $this->mapCoordenadas($src['volta'] ?? null),
        );

        return $percurso->vazio() ? null : $percurso;
    }
}
