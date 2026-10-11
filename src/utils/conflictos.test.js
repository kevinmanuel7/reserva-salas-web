import { describe, it, expect } from 'vitest';
import { hayConflicto } from './conflictos';

describe('hayConflicto', () => {
  const existentes = [
    { id: 1, salaId: 1, fecha: '2026-10-14', horaInicio: '09:00', horaFin: '10:30' },
  ];

  it('detecta un cruce de horario en la misma sala y fecha', () => {
    const nueva = { salaId: 1, fecha: '2026-10-14', horaInicio: '10:00', horaFin: '11:00' };
    expect(hayConflicto(existentes, nueva)).toBe(true);
  });

  it('permite bloques contiguos (uno termina cuando el otro empieza)', () => {
    const nueva = { salaId: 1, fecha: '2026-10-14', horaInicio: '10:30', horaFin: '12:00' };
    expect(hayConflicto(existentes, nueva)).toBe(false);
  });

  it('no marca conflicto si la sala o la fecha son distintas', () => {
    const otraSala = { salaId: 2, fecha: '2026-10-14', horaInicio: '09:00', horaFin: '10:30' };
    const otraFecha = { salaId: 1, fecha: '2026-10-15', horaInicio: '09:00', horaFin: '10:30' };
    expect(hayConflicto(existentes, otraSala)).toBe(false);
    expect(hayConflicto(existentes, otraFecha)).toBe(false);
  });
});
