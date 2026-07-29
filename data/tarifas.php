<?php

declare(strict_types=1);

/**
 * Tarifas do transporte público.
 * Fonte: Secretaria de Transporte e Mobilidade do DF (SEMOB).
 */
return [
    'df' => [
        'fonte' => 'Com informações da Secretaria de Transporte e Mobilidade — tarifas em vigor a partir de 20/01/2020.',
        'itens' => [
            ['tipo' => 'Circular Interna',    'valor' => 'R$ 2,70'],
            ['tipo' => 'Ligações Curtas',     'valor' => 'R$ 3,80'],
            ['tipo' => 'Longas / Integração', 'valor' => 'R$ 5,50'],
            ['tipo' => 'Metrô',               'valor' => 'R$ 5,50'],
        ],
    ],

    'entorno' => [
        'fonte' => 'Tarifas intermunicipais (Entorno ↔ Distrito Federal) vigentes em 2026. Valores sujeitos a alteração pelos órgãos reguladores.',
        // `marcador` é opcional (ex.: serviço Executivo).
        'itens' => [
            ['uf_origem' => 'GO', 'origem' => 'PLANALTINA',                  'uf_destino' => 'DF', 'destino' => 'BRASILIA',   'valor' => 'R$ 11,60'],
            ['uf_origem' => 'GO', 'origem' => 'PLANALTINA',                  'uf_destino' => 'DF', 'destino' => 'SOBRADINHO', 'valor' => 'R$ 7,60'],
            ['uf_origem' => 'GO', 'origem' => 'PLANALTINA',                  'uf_destino' => 'DF', 'destino' => 'PLANALTINA', 'valor' => 'R$ 6,20'],
            ['uf_origem' => 'GO', 'origem' => 'FORMOSA',                     'uf_destino' => 'DF', 'destino' => 'PLANALTINA', 'valor' => 'R$ 8,20'],
            ['uf_origem' => 'GO', 'origem' => 'LUZIANIA',                    'uf_destino' => 'DF', 'destino' => 'BRASILIA',   'valor' => 'R$ 10,95'],
            ['uf_origem' => 'GO', 'origem' => 'LUZIANIA',                    'uf_destino' => 'DF', 'destino' => 'GAMA',       'valor' => 'R$ 8,15'],
            ['uf_origem' => 'GO', 'origem' => 'LUZIANIA',                    'uf_destino' => 'DF', 'destino' => 'TAGUATINGA', 'valor' => 'R$ 12,30'],
            ['uf_origem' => 'GO', 'origem' => 'PARQUE INDUSTRIAL MINGONE',   'uf_destino' => 'DF', 'destino' => 'BRASILIA',   'valor' => 'R$ 9,30'],
            ['uf_origem' => 'GO', 'origem' => 'PARQUE INDUSTRIAL MINGONE',   'uf_destino' => 'DF', 'destino' => 'TAGUATINGA', 'valor' => 'R$ 10,65'],
            ['uf_origem' => 'GO', 'origem' => 'PARQUE INDUSTRIAL MINGONE',   'uf_destino' => 'DF', 'destino' => 'GAMA',       'valor' => 'R$ 6,10'],
            ['uf_origem' => 'GO', 'origem' => 'NOVO GAMA',                   'uf_destino' => 'DF', 'destino' => 'BRASILIA',   'valor' => 'R$ 12,35'],
            ['uf_origem' => 'GO', 'origem' => 'AGUAS LINDAS DE GOIAS',       'uf_destino' => 'DF', 'destino' => 'BRASILIA',   'valor' => 'R$ 11,45'],
            ['uf_origem' => 'GO', 'origem' => 'SANTO ANTONIO DO DESCOBERTO', 'uf_destino' => 'DF', 'destino' => 'BRASILIA',   'valor' => 'R$ 10,75'],
            ['uf_origem' => 'GO', 'origem' => 'SANTO ANTONIO DO DESCOBERTO', 'uf_destino' => 'DF', 'destino' => 'TAGUATINGA', 'valor' => 'R$ 8,60'],
            ['uf_origem' => 'GO', 'origem' => 'AGUAS LINDAS DE GOIAS',       'uf_destino' => 'DF', 'destino' => 'CEILANDIA',  'valor' => 'R$ 5,85'],
            ['uf_origem' => 'GO', 'origem' => 'AGUAS LINDAS DE GOIAS',       'uf_destino' => 'DF', 'destino' => 'TAGUATINGA', 'valor' => 'R$ 7,65'],
            ['uf_origem' => 'GO', 'origem' => 'GIRASSOL (COCALZINHO)',       'uf_destino' => 'DF', 'destino' => 'BRASILIA',   'valor' => 'R$ 12,15'],
            ['uf_origem' => 'GO', 'origem' => 'GIRASSOL (COCALZINHO)',       'uf_destino' => 'DF', 'destino' => 'TAGUATINGA', 'valor' => 'R$ 9,15'],
            ['uf_origem' => 'GO', 'origem' => 'NOVO GAMA',                   'uf_destino' => 'DF', 'destino' => 'TAGUATINGA', 'valor' => 'R$ 8,75'],
            ['uf_origem' => 'GO', 'origem' => 'PEDREGAL',                    'uf_destino' => 'DF', 'destino' => 'GAMA',       'valor' => 'R$ 3,40'],
            ['uf_origem' => 'GO', 'origem' => 'LAGO AZUL/GO',                'uf_destino' => 'DF', 'destino' => 'GAMA',       'valor' => 'R$ 3,40'],
            ['uf_origem' => 'GO', 'origem' => 'NOVO GAMA',                   'uf_destino' => 'DF', 'destino' => 'GAMA',       'valor' => 'R$ 1,80'],
            ['uf_origem' => 'GO', 'origem' => 'CÉU AZUL',                    'uf_destino' => 'DF', 'destino' => 'BRASILIA',   'valor' => 'R$ 7,30'],
            ['uf_origem' => 'GO', 'origem' => 'VALPARAISO DE GOIAS',         'uf_destino' => 'DF', 'destino' => 'BRASILIA',   'valor' => 'R$ 8,00'],
            ['uf_origem' => 'GO', 'origem' => 'VALPARAISO DE GOIAS',         'uf_destino' => 'DF', 'destino' => 'GAMA',       'valor' => 'R$ 5,15'],
            ['uf_origem' => 'GO', 'origem' => 'VALPARAISO DE GOIAS',         'uf_destino' => 'DF', 'destino' => 'TAGUATINGA', 'valor' => 'R$ 9,35'],
            ['uf_origem' => 'GO', 'origem' => 'CIDADE OCIDENTAL',            'uf_destino' => 'DF', 'destino' => 'BRASILIA',   'valor' => 'R$ 8,90'],
            ['uf_origem' => 'GO', 'origem' => 'CIDADE OCIDENTAL',            'uf_destino' => 'DF', 'destino' => 'BRASILIA',   'valor' => 'R$ 18,00', 'marcador' => 'Executivo'],
            ['uf_origem' => 'GO', 'origem' => 'CIDADE OCIDENTAL',            'uf_destino' => 'DF', 'destino' => 'TAGUATINGA', 'valor' => 'R$ 10,25'],
            ['uf_origem' => 'GO', 'origem' => 'CIDADE OCIDENTAL',            'uf_destino' => 'DF', 'destino' => 'GAMA',       'valor' => 'R$ 6,05'],
            ['uf_origem' => 'GO', 'origem' => 'MONTE ALTO (PADRE BERNARDO)', 'uf_destino' => 'DF', 'destino' => 'BRAZLANDIA', 'valor' => 'R$ 3,00'],
            ['uf_origem' => 'GO', 'origem' => 'MONTE ALTO (PADRE BERNARDO)', 'uf_destino' => 'DF', 'destino' => 'TAGUATINGA', 'valor' => 'R$ 9,60'],
            ['uf_origem' => 'GO', 'origem' => 'MONTE ALTO (PADRE BERNARDO)', 'uf_destino' => 'DF', 'destino' => 'BRASILIA',   'valor' => 'R$ 10,40'],
            ['uf_origem' => 'GO', 'origem' => 'NOVO GAMA',                   'uf_destino' => 'DF', 'destino' => 'BRASILIA',   'valor' => 'R$ 10,35'],
            ['uf_origem' => 'GO', 'origem' => 'AGUAS LINDAS DE GOIAS',       'uf_destino' => 'DF', 'destino' => 'BRAZLANDIA', 'valor' => 'R$ 6,15'],
        ],
    ],
];
