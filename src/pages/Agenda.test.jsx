import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Agenda from './Agenda';
import { obtenerReservasPorFecha } from '../services/reservasService';

// MOCK: reemplazamos el service de reservas por una función falsa.
// Así la prueba no depende de las reservas guardadas y controlamos qué "devuelve la base de datos".
vi.mock('../services/reservasService', () => ({
  obtenerReservasPorFecha: vi.fn(),
}));

// La página usa useAuth (sesión) y Link (router): se envuelve igual que en main.jsx
const renderizarAgenda = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <Agenda />
      </AuthProvider>
    </MemoryRouter>
  );

describe('Página Agenda', () => {
  beforeEach(() => {
    obtenerReservasPorFecha.mockReset();
    obtenerReservasPorFecha.mockReturnValue([]);
    localStorage.setItem('usuario', JSON.stringify({ nombre: 'Ana Pérez', rol: 'relator' }));
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
        ? [{ id: 1, salaId: 1, fecha, horaInicio: '08:00', horaFin: '09:00', relator: 'Otro Relator', actividad: 'Curso Excel' }]
        : []
    );

    renderizarAgenda();

    // Buscamos solo DENTRO de la tabla (la leyenda de arriba también dice "Ocupado")
    const tabla = screen.getByRole('table');
    expect(within(tabla).queryByText('Ocupado')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-10-14' } });

    expect(obtenerReservasPorFecha).toHaveBeenLastCalledWith('2026-10-14');
    expect(within(tabla).getByText('Ocupado')).toBeInTheDocument();
    expect(within(tabla).getByText('Curso Excel')).toBeInTheDocument();
  });

  it('al presionar "Reservar" agrega el bloque al borrador con el relator logeado', () => {
    renderizarAgenda();

    fireEvent.click(screen.getByRole('button', { name: 'Reservar Sala 101 de 08:00 a 09:00' }));

    const borrador = JSON.parse(localStorage.getItem('reservas_borrador'));
    expect(borrador).toHaveLength(1);
    expect(borrador[0]).toMatchObject({
      salaId: 1, fecha: '2026-10-13', horaInicio: '08:00', horaFin: '09:00', relator: 'Ana Pérez',
    });
    expect(within(screen.getByRole('table')).getByText('En tu reserva')).toBeInTheDocument();
  });

  it('en una fecha pasada no permite reservar', () => {
    renderizarAgenda();

    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-10-01' } });

    expect(screen.queryAllByRole('button', { name: /^Reservar/ })).toHaveLength(0);
    expect(screen.getByText(/fecha pasada/)).toBeInTheDocument();
  });
});
