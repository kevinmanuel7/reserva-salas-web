import { describe, it, expect } from 'vitest';
import { validarBloque } from './validaciones';

describe('validarBloque', () => {
  const hoy = '2026-10-14';
  const bloque = { inicio: '08:00', fin: '09:00' };

  it('no devuelve errores si los datos son válidos', () => {
    expect(validarBloque({ fecha: '2026-10-15', bloque, actividad: 'Curso Excel' }, hoy)).toEqual({});
  });

  it('marca campos vacíos y fechas pasadas', () => {
    const errores = validarBloque({ fecha: '2026-10-01', bloque: undefined, actividad: '  ' }, hoy);
    expect(errores.fecha).toMatch(/fecha pasada/);
    expect(errores.bloque).toBeDefined();
    expect(errores.actividad).toBeDefined();
  });
});
