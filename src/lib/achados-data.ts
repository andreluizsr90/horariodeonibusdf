/**
 * Dados de "Achados e Perdidos" — contatos das operadoras do Serviço
 * Convencional de transporte do Distrito Federal.
 */

export interface Operadora {
  nome: string;
  endereco: string;
  telefones: string[];
  fax?: string;
  regiao: string;
}

export const introAchadosEPerdidos =
  "Caso tenha perdido qualquer item dentro do ônibus no Distrito Federal, você deverá entrar em contato diretamente com a operadora de transporte. Abaixo estão os endereços e telefones para atendimento ao usuário das empresas que fazem parte do Serviço Convencional.";

export const operadoras: Operadora[] = [
  {
    nome: "TCB",
    endereco: "SGON Quadra 06, Bloco A, Brasília-DF. CEP: 70610-600",
    telefones: ["(61) 3344-2769"],
    fax: "(61) 3344-2769",
    regiao: "Plano Piloto.",
  },
  {
    nome: "Viação Piracicabana",
    endereco: "SGON, Quadra 6, Lote Único, Bloco H",
    telefones: ["(61) 3038-4647"],
    regiao:
      "Bacia 1 (Norte: Brasília, Sobradinho, Planaltina, Cruzeiro, Sobradinho 2, Lago Norte, Sudoeste/Octogonal, Varjão e Fercal) – 417 ônibus.",
  },
  {
    nome: "Viação Pioneira",
    endereco: "SGCV Sul, Lote 18, SOF Sul, Guará-DF. CEP: 71215-100",
    telefones: ["(61) 2106-9400", "(61) 3377-3373"],
    regiao:
      "Bacia 2 (Sudeste: Itapoã, Paranoá, Jardim Botânico, Lago Sul, Candangolândia, Park Way, Santa Maria, São Sebastião e Gama) – 640 ônibus.",
  },
  {
    nome: "Viação HP-Ita (Urbi)",
    endereco: "SOF Sul, Quadra 09, Conjunto A, Lote 1/3, Guará",
    telefones: ["(61) 3106-4200"],
    regiao:
      "Bacia 3 (Sudoeste: Núcleo Bandeirante, Samambaia, Recanto das Emas e Riacho Fundo 1 e 2) – 483 ônibus.",
  },
  {
    nome: "Viação Marechal",
    endereco: "SIA Trecho 1, Lote 1650/1700",
    telefones: ["(61) 3012-8000"],
    regiao:
      "Bacia 4 (Centro-Oeste: parte de Taguatinga e do Park Way, Ceilândia, Guará e Águas Claras) – 464 ônibus.",
  },
  {
    nome: "São José",
    endereco: "SGCV Sul, Lote 5-A, Guará-DF. CEP: 71215-550",
    telefones: ["(61) 3363-4333"],
    regiao:
      "Bacia 5 (Noroeste: SIA, SCIA, Vicente Pires, Ceilândia (ao norte da Av. Hélio Prates), Taguatinga (ao norte da QNG 11) e Brazlândia) – 576 ônibus.",
  },
];
