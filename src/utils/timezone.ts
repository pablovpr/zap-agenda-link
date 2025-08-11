import { parseISO, format as dateFnsFormat } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Timezone do Brasil
export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

// Usar Intl.DateTimeFormat para conversões de timezone
const convertToTimezone = (date: Date, timeZone: string): Date => {
  // Usar Intl.DateTimeFormat para obter a data no timezone específico
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');

  return new Date(year, month, day, hour, minute, second);
};

const convertFromTimezone = (date: Date, timeZone: string): Date => {
  // Calcular o offset do timezone
  const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  const targetDate = new Date(utcDate.toLocaleString('en-US', { timeZone }));
  const offset = targetDate.getTime() - utcDate.getTime();
  return new Date(date.getTime() - offset);
};

// Re-export format
export const format = dateFnsFormat;

/**
 * Converte uma data UTC para o horário de Brasília
 */
export const utcToBrazilTime = (utcDate: Date | string): Date => {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  return convertToTimezone(date, BRAZIL_TIMEZONE);
};

/**
 * Converte uma data do horário de Brasília para UTC
 */
export const brazilTimeToUtc = (brazilDate: Date): Date => {
  return convertFromTimezone(brazilDate, BRAZIL_TIMEZONE);
};

/**
 * Formata uma data UTC para exibição no horário de Brasília
 */
export const formatUtcToBrazilTime = (
  utcDate: Date | string,
  formatString: string = 'dd/MM/yyyy HH:mm'
): string => {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  const brazilDate = utcToBrazilTime(date);
  return dateFnsFormat(brazilDate, formatString, { locale: ptBR });
};

/**
 * Função utilitária principal para formatação de datas no Brasil
 * Esta deve ser usada em todo o frontend para exibir datas
 */
export const formatToBrasilia = (
  date: Date | string,
  formatString: string = 'dd/MM/yyyy HH:mm'
): string => {
  return formatUtcToBrazilTime(date, formatString);
};

/**
 * Converte dados do banco (UTC) para exibição no Brasil
 * Usar esta função ao receber dados de appointments, etc.
 */
export const convertDatabaseDateToBrasilia = (
  utcDate: string,
  formatString: string = 'dd/MM/yyyy HH:mm'
): string => {
  return formatUtcToBrazilTime(utcDate, formatString);
};

/**
 * Converte entrada do usuário (Brasil) para UTC antes de salvar no banco
 */
export const convertBrasiliaToDatabase = (dateStr: string, timeStr: string): string => {
  const utcDate = brazilDateTimeToUtc(dateStr, timeStr);
  return utcDate.toISOString();
};

/**
 * Obtém a data atual no horário de Brasília
 */
export const getNowInBrazil = (): Date => {
  return convertToTimezone(new Date(), BRAZIL_TIMEZONE);
};

/**
 * Obtém a data atual no horário de Brasília formatada como string ISO (YYYY-MM-DD)
 */
export const getTodayInBrazil = (): string => {
  const now = getNowInBrazil();
  return dateFnsFormat(now, 'yyyy-MM-dd');
};

/**
 * Obtém o horário atual no horário de Brasília formatado como string (HH:mm)
 */
export const getCurrentTimeInBrazil = (): string => {
  const now = getNowInBrazil();
  return dateFnsFormat(now, 'HH:mm');
};

/**
 * Converte uma string de data (YYYY-MM-DD) e hora (HH:mm) do Brasil para UTC
 */
export const brazilDateTimeToUtc = (dateStr: string, timeStr: string): Date => {
  // Criar data no horário de Brasília
  const brazilDateTime = new Date(`${dateStr}T${timeStr}:00`);
  return convertFromTimezone(brazilDateTime, BRAZIL_TIMEZONE);
};

/**
 * Verifica se uma data/hora já passou no horário de Brasília
 */
export const isDateTimePastInBrazil = (dateStr: string, timeStr?: string): boolean => {
  const now = getNowInBrazil();
  const targetDate = new Date(`${dateStr}T${timeStr || '00:00'}:00`);

  if (timeStr) {
    return targetDate < now;
  } else {
    // Se não tem horário, compara apenas a data
    const today = getTodayInBrazil();
    return dateStr < today;
  }
};

/**
 * Formata timestamp do banco (UTC) para exibição no Brasil
 */
export const formatDatabaseTimestamp = (
  timestamp: string,
  formatString: string = 'dd/MM/yyyy HH:mm'
): string => {
  return formatUtcToBrazilTime(timestamp, formatString);
};

/**
 * Converte horário de trabalho (string HH:mm) considerando timezone
 */
export const convertWorkingHours = (timeStr: string): string => {
  // Para horários de trabalho, não precisamos converter timezone
  // pois são horários locais da empresa
  return timeStr;
};

/**
 * Debug: Mostra comparação de horários (apenas em desenvolvimento)
 */
export const debugTimezone = () => {
  if (process.env.NODE_ENV === 'development') {
    const now = new Date();
    const brazilTime = getNowInBrazil();

    console.log('🕐 Debug Timezone:', {
      utc: now.toISOString(),
      brazil: brazilTime.toISOString(),
      utc_formatted: dateFnsFormat(now, 'yyyy-MM-dd HH:mm:ss'),
      brazil_formatted: dateFnsFormat(brazilTime, 'yyyy-MM-dd HH:mm:ss'),
      timezone: BRAZIL_TIMEZONE
    });
  }
};
