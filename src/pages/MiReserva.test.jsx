import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import MiReserva from './MiReserva';

const renderizarMiReserva = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <MiReserva />
      </AuthProvider>
    </MemoryRouter>
  );

const bloque = (idTemporal, extra = {}) => ({
  idTemporal, salaId: 1, fecha: '2026-10-20', horaInicio: '08:00', horaFin: '09:00',
  relator: 'Bastián Veas', actividad: 'Curso Excel', ...extra,
});

const leer = (clave) => JSON.parse(localStorage.getItem(clave));

describe('Página Mi reserva', () => {
  beforeEach(() => {
    localStorage.setItem('usuario', JSON.stringify({ nombre: 'Bastián Veas', rol: 'relator' }));
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 13, 12, 0)); // "hoy" = 13-10-2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra un aviso cuando el borrador está vacío', () => {
    renderizarMiReserva();
    expect(screen.getByText(/no tienes bloques en tu reserva/i)).toBeInTheDocument();
  });

  it('"Quitar" elimina ese bloque del borrador', () => {
    localStorage.setItem('reservas_borrador', JSON.stringify([
      bloque(1), bloque(2, { horaInicio: '09:05', horaFin: '10:00', actividad: 'Taller' }),
    ]));
    renderizarMiReserva();

    fireEvent.click(screen.getAllByRole('button', { name: 'Quitar' })[0]);

    expect(leer('reservas_borrador').map((b) => b.idTemporal)).toEqual([2]);
    expect(screen.queryByDisplayValue('Curso Excel')).not.toBeInTheDocument();
  });

  it('no confirma si falta la actividad de algún bloque', () => {
    localStorage.setItem('reservas_borrador', JSON.stringify([bloque(1, { actividad: '' })]));
    renderizarMiReserva();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar reservas' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/completa la actividad de todos los bloques/i);
    expect(localStorage.getItem('reservas')).toBeNull();
  });

  it('confirma todo o nada: si un bloque choca, no se guarda ninguno', () => {
    localStorage.setItem('reservas', JSON.stringify([
      { id: 50, salaId: 2, fecha: '2026-10-20', horaInicio: '09:05', horaFin: '10:00', relator: 'Otro', actividad: 'X' },
    ]));
    localStorage.setItem('reservas_borrador', JSON.stringify([
      bloque(1),                                                          // libre
      bloque(2, { salaId: 2, horaInicio: '09:05', horaFin: '10:00' }),    // choca
    ]));
    renderizarMiReserva();

    expect(screen.getByText('Choque de horario')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar reservas' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/chocan/);
    expect(leer('reservas')).toHaveLength(1);           // solo la que ya existía
    expect(leer('reservas_borrador')).toHaveLength(2);  // el borrador sigue intacto
  });

  it('si no hay choques, guarda todas las reservas y vacía el borrador', () => {
    localStorage.setItem('reservas_borrador', JSON.stringify([
      bloque(1), bloque(2, { horaInicio: '09:05', horaFin: '10:00', actividad: 'Taller' }),
    ]));
    renderizarMiReserva();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar reservas' }));

    const reservas = leer('reservas');
    expect(reservas).toHaveLength(2);
    expect(reservas[0]).toMatchObject({ relator: 'Bastián Veas', actividad: 'Curso Excel' });
    expect(reservas[0].idTemporal).toBeUndefined(); // se guardan limpias, sin datos del borrador
    expect(localStorage.getItem('reservas_borrador')).toBeNull();
    expect(screen.getByText(/reservas confirmadas con éxito/i)).toBeInTheDocument();
  });
});
