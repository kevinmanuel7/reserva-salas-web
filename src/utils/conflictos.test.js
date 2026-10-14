import { describe, it, expect } from 'vitest';
import { hayConflicto, bloqueDisponible, bloquesConConflicto } from './conflictos';

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

describe('bloqueDisponible y bloquesConConflicto (borrador)', () => {
  const reservas = [
    { id: 1, salaId: 1, fecha: '2026-10-20', horaInicio: '08:00', horaFin: '09:00' },
  ];
  const borrador = [
    { idTemporal: 100, salaId: 2, fecha: '2026-10-20', horaInicio: '09:05', horaFin: '10:00' },
  ];

  it('un bloque ya presente en el borrador no está disponible', () => {
    const repetido = { salaId: 2, fecha: '2026-10-20', horaInicio: '09:05', horaFin: '10:00' };
    const libre = { salaId: 2, fecha: '2026-10-20', horaInicio: '10:05', horaFin: '11:00' };
    expect(bloqueDisponible(reservas, borrador, repetido)).toBe(false);
    expect(bloqueDisponible(reservas, borrador, libre)).toBe(true);
  });

  it('marca los bloques del borrador que chocan con reservas o entre sí', () => {
    const conChoques = [
      { idTemporal: 1, salaId: 1, fecha: '2026-10-20', horaInicio: '08:00', horaFin: '09:00' }, // choca con reserva
      { idTemporal: 2, salaId: 3, fecha: '2026-10-20', horaInicio: '10:05', horaFin: '11:00' }, // choca con el 3
      { idTemporal: 3, salaId: 3, fecha: '2026-10-20', horaInicio: '10:05', horaFin: '11:00' },
      { idTemporal: 4, salaId: 3, fecha: '2026-10-20', horaInicio: '11:05', horaFin: '12:00' }, // ok
    ];
    expect(bloquesConConflicto(reservas, conChoques)).toEqual([1, 2, 3]);
  });
});
