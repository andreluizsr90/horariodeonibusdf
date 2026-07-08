/**
 * Aviso amigável exibido quando a API está indisponível ou não configurada.
 * Evita "quebrar" a página inteira por falha de integração.
 */
export function ApiErrorNotice({
  title = "Não foi possível carregar os dados",
}: {
  title?: string;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center"
    >
      <p className="text-lg font-semibold text-amber-800">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-amber-700">
        Estamos com uma instabilidade temporária na conexão com o serviço de
        dados. Por favor, tente novamente em alguns instantes.
      </p>
    </div>
  );
}
