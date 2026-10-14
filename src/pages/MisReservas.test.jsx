import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import MisReservas from './MisReservas';

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
    // Preparamos localStorage: usuario logeado + reservas de dos relatores
    localStorage.setItem('usuario', JSON.stringify({ nombre: 'Ana Pérez', rol: 'relator' }));
    localStorage.setItem('reservas', JSON.stringify([
      { id: 1, salaId: 1, fecha: '2026-10-14', horaInicio: '08:30', horaFin: '10:00', relator: 'Ana Pérez', actividad: 'Curso Excel' },
      { id: 2, salaId: 2, fecha: '2026-10-14', horaInicio: '10:15', horaFin: '11:45', relator: 'Otro Relator', actividad: 'Taller ajeno' },
    ]));
  });

  it('muestra solo las reservas del relator logeado', () => {
    renderizarPagina();

    expect(screen.getByText('Curso Excel')).toBeInTheDocument();
    expect(screen.queryByText('Taller ajeno')).not.toBeInTheDocument();
  });

  it('al cancelar, la reserva desaparece, se borra de localStorage y se muestra un mensaje', () => {
    renderizarPagina();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByText('Curso Excel')).not.toBeInTheDocument();
    expect(screen.getByText('La reserva fue cancelada correctamente.')).toBeInTheDocument();
    expect(screen.getByText(/No tienes reservas confirmadas/)).toBeInTheDocument();

    const guardadas = JSON.parse(localStorage.getItem('reservas'));
    expect(guardadas.map((r) => r.id)).toEqual([2]); // la del otro relator sigue ahí
  });
});
