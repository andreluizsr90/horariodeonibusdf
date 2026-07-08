/**
 * Dados estáticos de tarifas do transporte público.
 * Fonte: Secretaria de Transporte e Mobilidade do DF (SEMOB).
 */

export interface Tarifa {
  tipo: string;
  valor: string;
}

export const tarifasDistritoFederal: Tarifa[] = [
  { tipo: "Circular Interna", valor: "R$ 2,70" },
  { tipo: "Ligações Curtas", valor: "R$ 3,80" },
  { tipo: "Longas / Integração", valor: "R$ 5,50" },
  { tipo: "Metrô", valor: "R$ 5,50" },
];

export const fonteTarifasDistritoFederal =
  "Com informações da Secretaria de Transporte e Mobilidade — tarifas em vigor a partir de 20/01/2020.";

/** Tarifa intermunicipal (Entorno ↔ Distrito Federal). */
export interface TarifaEntorno {
  ufOrigem: string;
  origem: string;
  ufDestino: string;
  destino: string;
  valor: string;
  /** Rótulo opcional do serviço (ex.: "Executivo"). */
  marcador?: string;
}

export const tarifasCidadesEntorno: TarifaEntorno[] = [
  { ufOrigem: "GO", origem: "PLANALTINA", ufDestino: "DF", destino: "BRASILIA", valor: "R$ 11,60" },
  { ufOrigem: "GO", origem: "PLANALTINA", ufDestino: "DF", destino: "SOBRADINHO", valor: "R$ 7,60" },
  { ufOrigem: "GO", origem: "PLANALTINA", ufDestino: "DF", destino: "PLANALTINA", valor: "R$ 6,20" },
  { ufOrigem: "GO", origem: "FORMOSA", ufDestino: "DF", destino: "PLANALTINA", valor: "R$ 8,20" },
  { ufOrigem: "GO", origem: "LUZIANIA", ufDestino: "DF", destino: "BRASILIA", valor: "R$ 10,95" },
  { ufOrigem: "GO", origem: "LUZIANIA", ufDestino: "DF", destino: "GAMA", valor: "R$ 8,15" },
  { ufOrigem: "GO", origem: "LUZIANIA", ufDestino: "DF", destino: "TAGUATINGA", valor: "R$ 12,30" },
  { ufOrigem: "GO", origem: "PARQUE INDUSTRIAL MINGONE", ufDestino: "DF", destino: "BRASILIA", valor: "R$ 9,30" },
  { ufOrigem: "GO", origem: "PARQUE INDUSTRIAL MINGONE", ufDestino: "DF", destino: "TAGUATINGA", valor: "R$ 10,65" },
  { ufOrigem: "GO", origem: "PARQUE INDUSTRIAL MINGONE", ufDestino: "DF", destino: "GAMA", valor: "R$ 6,10" },
  { ufOrigem: "GO", origem: "NOVO GAMA", ufDestino: "DF", destino: "BRASILIA", valor: "R$ 12,35" },
  { ufOrigem: "GO", origem: "AGUAS LINDAS DE GOIAS", ufDestino: "DF", destino: "BRASILIA", valor: "R$ 11,45" },
  { ufOrigem: "GO", origem: "SANTO ANTONIO DO DESCOBERTO", ufDestino: "DF", destino: "BRASILIA", valor: "R$ 10,75" },
  { ufOrigem: "GO", origem: "SANTO ANTONIO DO DESCOBERTO", ufDestino: "DF", destino: "TAGUATINGA", valor: "R$ 8,60" },
  { ufOrigem: "GO", origem: "AGUAS LINDAS DE GOIAS", ufDestino: "DF", destino: "CEILANDIA", valor: "R$ 5,85" },
  { ufOrigem: "GO", origem: "AGUAS LINDAS DE GOIAS", ufDestino: "DF", destino: "TAGUATINGA", valor: "R$ 7,65" },
  { ufOrigem: "GO", origem: "GIRASSOL (COCALZINHO)", ufDestino: "DF", destino: "BRASILIA", valor: "R$ 12,15" },
  { ufOrigem: "GO", origem: "GIRASSOL (COCALZINHO)", ufDestino: "DF", destino: "TAGUATINGA", valor: "R$ 9,15" },
  { ufOrigem: "GO", origem: "NOVO GAMA", ufDestino: "DF", destino: "TAGUATINGA", valor: "R$ 8,75" },
  { ufOrigem: "GO", origem: "PEDREGAL", ufDestino: "DF", destino: "GAMA", valor: "R$ 3,40" },
  { ufOrigem: "GO", origem: "LAGO AZUL/GO", ufDestino: "DF", destino: "GAMA", valor: "R$ 3,40" },
  { ufOrigem: "GO", origem: "NOVO GAMA", ufDestino: "DF", destino: "GAMA", valor: "R$ 1,80" },
  { ufOrigem: "GO", origem: "CÉU AZUL", ufDestino: "DF", destino: "BRASILIA", valor: "R$ 7,30" },
  { ufOrigem: "GO", origem: "VALPARAISO DE GOIAS", ufDestino: "DF", destino: "BRASILIA", valor: "R$ 8,00" },
  { ufOrigem: "GO", origem: "VALPARAISO DE GOIAS", ufDestino: "DF", destino: "GAMA", valor: "R$ 5,15" },
  { ufOrigem: "GO", origem: "VALPARAISO DE GOIAS", ufDestino: "DF", destino: "TAGUATINGA", valor: "R$ 9,35" },
  { ufOrigem: "GO", origem: "CIDADE OCIDENTAL", ufDestino: "DF", destino: "BRASILIA", valor: "R$ 8,90" },
  { ufOrigem: "GO", origem: "CIDADE OCIDENTAL", ufDestino: "DF", destino: "BRASILIA", valor: "R$ 18,00", marcador: "Executivo" },
  { ufOrigem: "GO", origem: "CIDADE OCIDENTAL", ufDestino: "DF", destino: "TAGUATINGA", valor: "R$ 10,25" },
  { ufOrigem: "GO", origem: "CIDADE OCIDENTAL", ufDestino: "DF", destino: "GAMA", valor: "R$ 6,05" },
  { ufOrigem: "GO", origem: "MONTE ALTO (PADRE BERNARDO)", ufDestino: "DF", destino: "BRAZLANDIA", valor: "R$ 3,00" },
  { ufOrigem: "GO", origem: "MONTE ALTO (PADRE BERNARDO)", ufDestino: "DF", destino: "TAGUATINGA", valor: "R$ 9,60" },
  { ufOrigem: "GO", origem: "MONTE ALTO (PADRE BERNARDO)", ufDestino: "DF", destino: "BRASILIA", valor: "R$ 10,40" },
  { ufOrigem: "GO", origem: "NOVO GAMA", ufDestino: "DF", destino: "BRASILIA", valor: "R$ 10,35" },
  { ufOrigem: "GO", origem: "AGUAS LINDAS DE GOIAS", ufDestino: "DF", destino: "BRAZLANDIA", valor: "R$ 6,15" },
];

export const fonteTarifasCidadesEntorno =
  "Tarifas intermunicipais (Entorno ↔ Distrito Federal) vigentes em 2026. Valores sujeitos a alteração pelos órgãos reguladores.";
