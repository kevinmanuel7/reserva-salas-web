import { describe, it, expect } from 'vitest';
import { validarBloque, validarSala } from './validaciones';

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

describe('validarSala', () => {
  it('acepta una sala válida', () => {
    expect(validarSala({ codigo: 'LAB-03', nombre: 'Lab Redes', capacidad: '20' }, ['S-101'])).toEqual({});
  });

  it('rechaza campos vacíos, capacidad no válida y códigos repetidos (sin importar mayúsculas)', () => {
    const errores = validarSala({ codigo: 's-101', nombre: '', capacidad: '0' }, ['S-101']);
    expect(errores.codigo).toMatch(/ya existe/i);
    expect(errores.nombre).toBeDefined();
    expect(errores.capacidad).toBeDefined();
  });
});
