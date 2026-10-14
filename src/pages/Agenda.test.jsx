import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Agenda from './Agenda';
import { obtenerReservasPorFecha } from '../services/reservasService';

// MOCK: reemplazamos el service real por una función falsa.
// Así la prueba no depende de localStorage y controlamos qué "devuelve la base de datos".
vi.mock('../services/reservasService', () => ({
  obtenerReservasPorFecha: vi.fn(),
}));

describe('Página Agenda', () => {
  beforeEach(() => {
    obtenerReservasPorFecha.mockReset();
    // Fijamos "hoy" en una fecha conocida para que la prueba no dependa del día en que se ejecuta
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 13, 12, 0)); // 13-10-2026 (los meses parten en 0)
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('al cambiar la fecha, pide las reservas de ese día y las muestra', () => {
    obtenerReservasPorFecha.mockImplementation((fecha) =>
      fecha === '2026-10-14'
        ? [{ id: 1, salaId: 1, fecha, horaInicio: '08:30', horaFin: '10:00', relator: 'Ana Pérez', actividad: 'Curso Excel' }]
        : []
    );

    render(<Agenda />);

    // Buscamos solo DENTRO de la tabla (la leyenda de arriba también dice "Ocupado")
    const tabla = screen.getByRole('table');

    // Al inicio (fecha de hoy) no hay reservas
    expect(within(tabla).queryByText('Ocupado')).not.toBeInTheDocument();

    // El usuario elige otra fecha
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-10-14' } });

    // Se llamó al service con la nueva fecha y la tabla se actualizó
    expect(obtenerReservasPorFecha).toHaveBeenLastCalledWith('2026-10-14');
    expect(within(tabla).getByText('Ocupado')).toBeInTheDocument();
    expect(within(tabla).getByText('Curso Excel')).toBeInTheDocument();
  });
});