import type { ReactNode } from "react";
import { AdBanner } from "@/components/analytics/AdBanner";

/**
 * Template global (App Router).
 *
 * Diferente do `layout.tsx` — que persiste entre navegações — o `template.tsx`
 * é RECRIADO a cada navegação. Colocar o <AdBanner/> aqui garante que ele
 * remonte a cada mudança de rota, solicitando UM anúncio novo por
 * visualização de página, em TODAS as páginas (abaixo do cabeçalho).
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      {children}

      {/* Banner de rodapé — último conteúdo, logo antes do <Footer/>. */}
      <div className="container-page py-6">
        <AdBanner slot="5989010611" />
      </div>
    </>
  );
}
