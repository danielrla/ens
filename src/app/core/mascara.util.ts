/**
 * Funções utilitárias para formatação e desformatação de máscaras de entrada (CPF e Telefone).
 * As máscaras atuam estritamente na camada visual do frontend; os dados são purificados antes do envio ao backend.
 */

export function mascararCpf(valor: string | null | undefined): string {
  if (!valor) return '';
  const limpo = valor.replace(/\D/g, '').slice(0, 11);
  if (limpo.length <= 3) {
    return limpo;
  }
  if (limpo.length <= 6) {
    return `${limpo.slice(0, 3)}.${limpo.slice(3)}`;
  }
  if (limpo.length <= 9) {
    return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6)}`;
  }
  return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`;
}

export function mascararTelefone(valor: string | null | undefined): string {
  if (!valor) return '';
  const limpo = valor.replace(/\D/g, '').slice(0, 11);
  if (limpo.length === 0) return '';
  if (limpo.length <= 2) {
    return `(${limpo}`;
  }
  if (limpo.length <= 6) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2)}`;
  }
  if (limpo.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
  }
  // Celular: (00) 00000-0000
  return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7, 11)}`;
}

export function desmascarar(valor: string | null | undefined): string {
  if (!valor) return '';
  return valor.replace(/\D/g, '');
}
