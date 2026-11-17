import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MiReserva from './MiReserva';
import { confirmarVarias } from '../services/reservasService';

// MOCK de los services: la confirmación real (todo o nada) la hace ms-reservas
vi.mock('../services/salasService', () => ({
  obtenerSalas: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Sala 101' }, { id: 2, nombre: 'Sala 102' }]),
}));
vi.mock('../services/reservasService', () => ({
  confirmarVarias: vi.fn(),
}));

const renderizarMiReserva = () =>
  render(
    <MemoryRouter>
      <MiReserva />
    </MemoryRouter>
  );

const bloque = (idTemporal, extra = {}) => ({
  idTemporal, salaId: 1, fecha: '2026-10-20', horaInicio: '08:00', horaFin: '09:00',
  actividad: 'Curso Excel', ...extra,
});

const leer = (clave) => JSON.parse(localStorage.getItem(clave));

describe('Página Mi reserva', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(confirmarVarias).not.toHaveBeenCalled();
  });

  it('marca y no envía bloques del borrador que chocan entre sí', () => {
    localStorage.setItem('reservas_borrador', JSON.stringify([bloque(1), bloque(2, { actividad: 'Otro' })]));
    renderizarMiReserva();

    expect(screen.getAllByText('Choque de horario')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar reservas' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/chocan entre sí/);
    expect(confirmarVarias).not.toHaveBeenCalled();
  });

  it('si el backend rechaza el lote (409), muestra su mensaje y el borrador queda intacto', async () => {
    confirmarVarias.mockRejectedValue(new Error('Reserva 2 de 2: La sala ya está ocupada en alguno de esos bloques'));
    localStorage.setItem('reservas_borrador', JSON.stringify([
      bloque(1), bloque(2, { salaId: 2, horaInicio: '09:05', horaFin: '10:00' }),
    ]));
    renderizarMiReserva();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar reservas' }));

    expect(await screen.findByText(/Reserva 2 de 2/)).toBeInTheDocument();
    expect(leer('reservas_borrador')).toHaveLength(2);
  });

  it('si el backend acepta el lote, vacía el borrador y muestra el éxito', async () => {
    confirmarVarias.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    localStorage.setItem('reservas_borrador', JSON.stringify([
      bloque(1), bloque(2, { horaInicio: '09:05', horaFin: '10:00', actividad: 'Taller' }),
    ]));
    renderizarMiReserva();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar reservas' }));

    expect(await screen.findByText(/reservas confirmadas con éxito/i)).toBeInTheDocument();
    expect(confirmarVarias).toHaveBeenCalledWith([
      expect.objectContaining({ salaId: 1, horaInicio: '08:00', actividad: 'Curso Excel' }),
      expect.objectContaining({ salaId: 1, horaInicio: '09:05', actividad: 'Taller' }),
    ]);
    expect(localStorage.getItem('reservas_borrador')).toBeNull();
  });
});
