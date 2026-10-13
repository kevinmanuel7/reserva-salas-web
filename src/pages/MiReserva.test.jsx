import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import MiReserva from './MiReserva';
import * as borradorService from '../services/borradorService';
import * as reservasService from '../services/reservasService';

describe('Página de Mi Reserva', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('muestra mensaje cuando el borrador está vacío', () => {
    vi.spyOn(borradorService, 'obtenerBorrador').mockReturnValue([]);

    render(<MiReserva />);
    expect(screen.getByText(/no tienes bloques en borrador actualmente/i)).toBeInTheDocument();
  });

  test('permite quitar un elemento del borrador', () => {
    vi.spyOn(borradorService, 'obtenerBorrador').mockReturnValue([
      { salaId: '1', nombreSala: 'Sala A', fecha: '2026-10-15', horaInicio: '09:00', horaFin: '10:00', actividad: 'Reunión' }
    ]);
    const spyQuitar = vi.spyOn(borradorService, 'quitarBloque').mockImplementation(() => {});

    render(<MiReserva />);
    const botonQuitar = screen.getByRole('button', { name: /quitar/i });

    fireEvent.click(botonQuitar);

    expect(spyQuitar).toHaveBeenCalledWith(0);
  });

  test('confirma las reservas y vacía el borrador', () => {
    vi.spyOn(borradorService, 'obtenerBorrador').mockReturnValue([
      { salaId: '1', nombreSala: 'Sala A', fecha: '2026-10-15', horaInicio: '09:00', horaFin: '10:00', actividad: 'Reunión' }
    ]);
    const spyConfirmar = vi.spyOn(reservasService, 'confirmarReserva').mockImplementation(() => {});
    const spyVaciar = vi.spyOn(borradorService, 'vaciarBorrador').mockImplementation(() => {});

    render(<MiReserva />);
    const botonConfirmar = screen.getByRole('button', { name: /confirmar reservas/i });

    fireEvent.click(botonConfirmar);

    expect(spyConfirmar).toHaveBeenCalled();
    expect(spyVaciar).toHaveBeenCalled();
  });
});