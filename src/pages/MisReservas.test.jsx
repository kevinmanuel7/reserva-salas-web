import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import MisReservas from './MisReservas';
import { iniciarSesionDePrueba } from '../test/sesionDePrueba';
import { obtenerMisReservas, cancelarReserva } from '../services/reservasService';

// MOCK de los services: ms-reservas ya entrega solo las reservas del usuario del token
vi.mock('../services/salasService', () => ({
  obtenerSalas: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Sala 101' }]),
}));
vi.mock('../services/reservasService', () => ({
  obtenerMisReservas: vi.fn(),
  cancelarReserva: vi.fn(),
}));

// La página necesita el contexto de sesión (useAuth) y el router (Link),
// así que en la prueba la envolvemos igual que en main.jsx
const renderizarPagina = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <MisReservas />
      </AuthProvider>
    </MemoryRouter>
  );

describe('Página Mis reservas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    iniciarSesionDePrueba('Ana Pérez');
    obtenerMisReservas.mockResolvedValue([
      { id: 1, salaId: 1, fecha: '2026-11-20', horaInicio: '08:00', horaFin: '09:00', actividad: 'Curso Excel' },
    ]);
  });

  it('muestra las reservas que entrega GET /reservas/mias, con el nombre de la sala', async () => {
    renderizarPagina();

    expect(await screen.findByText('Curso Excel')).toBeInTheDocument();
    expect(screen.getByText('Sala 101')).toBeInTheDocument();
  });

  it('al cancelar, llama al backend, quita la reserva y muestra un mensaje', async () => {
    cancelarReserva.mockResolvedValue({ id: 1, estado: 'CANCELADA' });
    renderizarPagina();

    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));

    expect(await screen.findByText('La reserva fue cancelada correctamente.')).toBeInTheDocument();
    expect(cancelarReserva).toHaveBeenCalledWith(1);
    expect(screen.queryByText('Curso Excel')).not.toBeInTheDocument();
    expect(screen.getByText(/No tienes reservas confirmadas/)).toBeInTheDocument();
  });

  it('si el backend rechaza la cancelación, muestra el error y no quita la reserva', async () => {
    cancelarReserva.mockRejectedValue(new Error('No tienes permiso para cancelar esta reserva'));
    renderizarPagina();

    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));

    expect(await screen.findByText('No tienes permiso para cancelar esta reserva')).toBeInTheDocument();
    expect(screen.getByText('Curso Excel')).toBeInTheDocument();
  });
});
