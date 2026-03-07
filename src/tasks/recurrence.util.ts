export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type RecurrenceDuration = 'MONTH' | 'YEAR';

export interface RecurrenceOptions {
  type: RecurrenceType;
  daysOfWeek?: number[]; // 0=Dom, 1=Seg, ..., 6=Sáb — usado apenas em WEEKLY
  time: string; // "HH:MM" em UTC
  duration: RecurrenceDuration;
}

/**
 * Calcula todas as datas de ocorrência a partir de uma data de início.
 * O intervalo gerado é [startFrom, startFrom + duration) — fim exclusivo.
 * O horário de cada ocorrência é definido pelo campo `time` em UTC.
 */
export function calculateOccurrenceDates(
  startFrom: Date,
  options: RecurrenceOptions,
): Date[] {
  const [hours, minutes] = options.time.split(':').map(Number);

  const end = new Date(startFrom);
  if (options.duration === 'MONTH') {
    end.setUTCMonth(end.getUTCMonth() + 1);
  } else {
    end.setUTCFullYear(end.getUTCFullYear() + 1);
  }

  const dates: Date[] = [];
  const current = new Date(startFrom);
  current.setUTCHours(hours, minutes, 0, 0);

  if (options.type === 'WEEKLY') {
    while (current < end) {
      if (options.daysOfWeek?.includes(current.getUTCDay())) {
        dates.push(new Date(current));
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }
  } else if (options.type === 'DAILY') {
    while (current < end) {
      dates.push(new Date(current));
      current.setUTCDate(current.getUTCDate() + 1);
    }
  } else if (options.type === 'MONTHLY') {
    while (current < end) {
      dates.push(new Date(current));
      current.setUTCMonth(current.getUTCMonth() + 1);
    }
  }

  return dates;
}
