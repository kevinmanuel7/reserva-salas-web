import { describe, it, expect } from 'vitest';
import { reservaEnBloque } from './agenda';

describe('reservaEnBloque', () => {
  const reservas = [
    { id: 1, salaId: 1, fecha: '2026-10-14', horaInicio: '08:30', horaFin: '10:00', actividad: 'Curso Excel' },
  ];
  const bloque1 = { inicio: '08:30', fin: '10:00' };
  const bloque2 = { inicio: '10:15', fin: '11:45' };

  it('devuelve la reserva cuando ocupa el bloque de esa sala', () => {
    expect(reservaEnBloque(reservas, 1, bloque1)).toEqual(reservas[0]);
  });

  it('devuelve undefined si el bloque está libre o la sala es otra', () => {
    expect(reservaEnBloque(reservas, 1, bloque2)).toBeUndefined();
    expect(reservaEnBloque(reservas, 2, bloque1)).toBeUndefined();
  });

  it('detecta una reserva que ocupa solo parte del bloque', () => {
    const parcial = [{ id: 2, salaId: 1, horaInicio: '11:00', horaFin: '11:30' }];
    expect(reservaEnBloque(parcial, 1, bloque2)).toEqual(parcial[0]);
  });
});