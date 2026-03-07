import { calculateOccurrenceDates } from './recurrence.util.js';

// Referência: 2025-01-06 (segunda-feira, getUTCDay() = 1)
const MONDAY_JAN_6 = new Date('2025-01-06T00:00:00.000Z');
const WEDNESDAY_JAN_1 = new Date('2025-01-01T00:00:00.000Z');

describe('calculateOccurrenceDates', () => {
  describe('WEEKLY', () => {
    it('deve retornar as terças-feiras de um mês a partir de uma segunda-feira', () => {
      // Jan 7, 14, 21, 28 e Feb 4 → 5 terças antes de Feb 6
      const dates = calculateOccurrenceDates(MONDAY_JAN_6, {
        type: 'WEEKLY',
        daysOfWeek: [2],
        time: '09:00',
        duration: 'MONTH',
      });

      expect(dates).toHaveLength(5);
      dates.forEach((d) => expect(d.getUTCDay()).toBe(2));
    });

    it('deve retornar aproximadamente 52 terças-feiras para um ano', () => {
      const dates = calculateOccurrenceDates(MONDAY_JAN_6, {
        type: 'WEEKLY',
        daysOfWeek: [2],
        time: '09:00',
        duration: 'YEAR',
      });

      // Jan 7 2025 a Jan 5 2026 → 52 terças (ano de 52 semanas completas)
      expect(dates).toHaveLength(52);
    });

    it('deve suportar múltiplos dias da semana', () => {
      // Segundas e quartas de Jan 6 a Feb 6
      // Seg: Jan 6, 13, 20, 27, Feb 3 = 5 | Qua: Jan 8, 15, 22, 29, Feb 5 = 5 → 10
      const dates = calculateOccurrenceDates(MONDAY_JAN_6, {
        type: 'WEEKLY',
        daysOfWeek: [1, 3],
        time: '10:00',
        duration: 'MONTH',
      });

      expect(dates).toHaveLength(10);
      dates.forEach((d) => expect([1, 3]).toContain(d.getUTCDay()));
    });

    it('deve definir o horário UTC correto em todas as ocorrências', () => {
      const dates = calculateOccurrenceDates(MONDAY_JAN_6, {
        type: 'WEEKLY',
        daysOfWeek: [2],
        time: '14:30',
        duration: 'MONTH',
      });

      dates.forEach((d) => {
        expect(d.getUTCHours()).toBe(14);
        expect(d.getUTCMinutes()).toBe(30);
      });
    });
  });

  describe('DAILY', () => {
    it('deve retornar uma ocorrência por dia durante um mês (31 dias em janeiro)', () => {
      // Jan 1 a Jan 31 (Feb 1 excluded)
      const dates = calculateOccurrenceDates(WEDNESDAY_JAN_1, {
        type: 'DAILY',
        time: '08:00',
        duration: 'MONTH',
      });

      expect(dates).toHaveLength(31);
    });

    it('deve retornar 365 ocorrências durante um ano em ano não-bissexto', () => {
      const dates = calculateOccurrenceDates(WEDNESDAY_JAN_1, {
        type: 'DAILY',
        time: '08:00',
        duration: 'YEAR',
      });

      expect(dates).toHaveLength(365);
    });
  });

  describe('MONTHLY', () => {
    it('deve retornar uma ocorrência por mês durante um ano (12 meses)', () => {
      // Jan, Feb, ..., Dec (Jan do próximo ano excluído)
      const dates = calculateOccurrenceDates(WEDNESDAY_JAN_1, {
        type: 'MONTHLY',
        time: '09:00',
        duration: 'YEAR',
      });

      expect(dates).toHaveLength(12);
    });

    it('deve retornar uma ocorrência para duração de um mês', () => {
      // Somente Jan 1 (Feb 1 excluído)
      const dates = calculateOccurrenceDates(WEDNESDAY_JAN_1, {
        type: 'MONTHLY',
        time: '09:00',
        duration: 'MONTH',
      });

      expect(dates).toHaveLength(1);
    });
  });
});
