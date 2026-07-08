/** Definição central dos links de navegação, reutilizada em desktop e mobile. */

export interface NavLink {
  label: string;
  href: string;
  /** Submenu (dropdown), quando houver. */
  children?: { label: string; href: string }[];
}

export const navLinks: NavLink[] = [
  { label: "Página Inicial", href: "/" },
  { label: "Cidades", href: "/cidades" },
  { label: "Achados e Perdidos", href: "/achados-e-perdidos" },
  {
    label: "Tarifas",
    href: "/tarifas",
    children: [
      { label: "Distrito Federal", href: "/tarifas/distrito-federal" },
      { label: "Cidades do Entorno", href: "/tarifas/cidades-entorno" },
    ],
  },
];
