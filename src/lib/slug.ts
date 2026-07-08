/**
 * Gera um slug URL-safe a partir de um texto qualquer.
 * Remove acentos (marcas diacríticas), normaliza espaços e símbolos.
 */
export function slugify(input: string): string {
  const combiningMarks = new RegExp("[" + "\\u0300-\\u036f]", "g");
  return input
    .normalize("NFD")
    .replace(combiningMarks, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
