import { describe, it, expect } from 'vitest';
import { formatearFecha } from './fechas';

describe('formatearFecha', () => {
  it('convierte AAAA-MM-DD en DD-MM-AAAA', () => {
    expect(formatearFecha('2026-10-14')).toBe('14-10-2026');
  });
});
