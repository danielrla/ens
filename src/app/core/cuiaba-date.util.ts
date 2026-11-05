/**
 * Utilitário central de datas e fuso horário oficial das Equipes de Nossa Senhora:
 * Cuiabá/Mato Grosso (UTC-4 / America/Cuiaba).
 */

export const FUSO_CUIABA = 'America/Cuiaba';

/**
 * Retorna a data e hora atual no fuso de Cuiabá (UTC-4).
 */
export function agoraCuiaba(): Date {
  const agora = new Date();
  const utc = agora.getTime() + agora.getTimezoneOffset() * 60000;
  // Fuso de Cuiabá é fixo em UTC-4 (sem horário de verão)
  const offsetCuiabaMs = -4 * 3600000;
  return new Date(utc + offsetCuiabaMs);
}

/**
 * Retorna a data de hoje formatada como 'YYYY-MM-DD' segundo o fuso de Cuiabá.
 */
export function hojeCuiabaStr(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_CUIABA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Formata qualquer data (string ISO, 'YYYY-MM-DD' ou Date) para 'DD/MM/YYYY' ou 'DD/MM/YYYY às HH:mm'
 * estritamente no fuso de Cuiabá (UTC-4).
 */
export function formatarDataCuiaba(
  value: string | Date | null | undefined,
  comHora = false
): string {
  if (!value) return '—';

  try {
    // Se for string no formato YYYY-MM-DD simples (sem hora), interpreta como data local
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [ano, mes, dia] = value.split('-');
      return `${dia}/${mes}/${ano}`;
    }

    const dataObj = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(dataObj.getTime())) {
      return String(value);
    }

    const opcoes: Intl.DateTimeFormatOptions = {
      timeZone: FUSO_CUIABA,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };

    if (comHora) {
      opcoes.hour = '2-digit';
      opcoes.minute = '2-digit';
      const formatado = new Intl.DateTimeFormat('pt-BR', opcoes).format(dataObj);
      return formatado.replace(', ', ' às ');
    }

    return new Intl.DateTimeFormat('pt-BR', opcoes).format(dataObj);
  } catch {
    return String(value);
  }
}

/**
 * Calcula a quantidade de dias restantes até uma data final ('YYYY-MM-DD')
 * tomando como base o dia de hoje no fuso horário de Cuiabá (UTC-4).
 * Retorna valor positivo se ainda faltam dias, 0 se é hoje/venceu, ou negativo se já expirou.
 */
export function calcularDiasRestantesCuiaba(dataFimStr: string): number {
  if (!dataFimStr) return 0;

  const hoje = hojeCuiabaStr();
  const [anoHoje, mesHoje, diaHoje] = hoje.split('-').map(Number);
  const [anoFim, mesFim, diaFim] = dataFimStr.split('-').map(Number);

  const utcHoje = Date.UTC(anoHoje, mesHoje - 1, diaHoje);
  const utcFim = Date.UTC(anoFim, mesFim - 1, diaFim);

  const diffMs = utcFim - utcHoje;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
