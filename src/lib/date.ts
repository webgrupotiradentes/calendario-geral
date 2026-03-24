// Utilitários de datas (yyyy-MM-dd) sem problemas de timezone

/**
 * Converte uma string no formato `yyyy-MM-dd` para um Date local (00:00 no fuso do usuário).
 * Evita o shift de um dia que acontece quando se usa `new Date('yyyy-MM-dd')` (parse em UTC).
 */
export function parseYmdToLocalDate(ymd: string): Date {
  const [year, month, day] = ymd.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Converte o formato `HH:mm` ou `HH:mm:ss` para `HHhMM`.
 */
export function formatTimeToCustom(time: string | null | undefined): string {
  if (!time) return '';
  // Pega apenas HH:mm caso venha com segundos (HH:mm:ss)
  const [hours, minutes] = time.split(':');
  if (!hours || !minutes) return time.replace(':', 'h');
  return `${hours.padStart(2, '0')}h${minutes.padStart(2, '0')}`;
}
