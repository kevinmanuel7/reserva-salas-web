import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Salas from './Salas';

// MOCK del catálogo: dos salas conocidas para la prueba
vi.mock('../services/salasService', () => ({
  obtenerSalas: () => [
    { id: 1, nombre: 'Sala A', codigo: 'S-01', capacidad: 20, equipamiento: ['proyector'] },
    { id: 2, nombre: 'Sala B', codigo: 'S-02', capacidad: 5, equipamiento: ['climatizacion'] },
  ],
}));

const renderizarSalas = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <Salas />
      </AuthProvider>
    </MemoryRouter>
  );

// Abre el formulario de la tarjeta de "Sala A" y devuelve esa tarjeta
const abrirFormularioSalaA = () => {
  const tarjeta = screen.getByText('Sala A').closest('.card');
  fireEvent.click(within(tarjeta).getByRole('button', { name: 'Reservar esta sala' }));
  return tarjeta;
};

describe('Página de Salas', () => {
  beforeEach(() => {
    localStorage.setItem('usuario', JSON.stringify({ nombre: 'Bastián Veas', rol: 'relator' }));
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 13, 12, 0)); // "hoy" = 13-10-2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra la lista de salas', () => {
    renderizarSalas();
    expect(screen.getByText('Sala A')).toBeInTheDocument();
    expect(screen.getByText('Sala B')).toBeInTheDocument();
  });

  it('filtra las salas por capacidad mínima', () => {
    renderizarSalas();
    fireEvent.change(screen.getByLabelText(/capacidad mínima/i), { target: { value: '15' } });

    expect(screen.getByText('Sala A')).toBeInTheDocument();
    expect(screen.queryByText('Sala B')).not.toBeInTheDocument();
  });

  it('valida el formulario: no agrega nada si faltan el bloque y la actividad', () => {
    renderizarSalas();
    const tarjeta = abrirFormularioSalaA();

    fireEvent.click(within(tarjeta).getByRole('button', { name: 'Agregar a mi reserva' }));

    expect(within(tarjeta).getByText('Selecciona un bloque horario.')).toBeInTheDocument();
    expect(within(tarjeta).getByText('Indica la actividad o curso.')).toBeInTheDocument();
    expect(localStorage.getItem('reservas_borrador')).toBeNull();
  });

  it('con datos válidos agrega el bloque al borrador con fecha, horario y relator', () => {
    renderizarSalas();
    const tarjeta = abrirFormularioSalaA();

    fireEvent.change(within(tarjeta).getByLabelText('Fecha'), { target: { value: '2026-10-20' } });
    fireEvent.change(within(tarjeta).getByLabelText('Bloque horario'), { target: { value: '1' } }); // 09:05–10:00
    fireEvent.change(within(tarjeta).getByLabelText('Actividad o curso'), { target: { value: 'Taller Python' } });
    fireEvent.click(within(tarjeta).getByRole('button', { name: 'Agregar a mi reserva' }));

    const borrador = JSON.parse(localStorage.getItem('reservas_borrador'));
    expect(borrador).toHaveLength(1);
    expect(borrador[0]).toMatchObject({
      salaId: 1, fecha: '2026-10-20', horaInicio: '09:05', horaFin: '10:00',
      actividad: 'Taller Python', relator: 'Bastián Veas',
    });
    expect(screen.getByText(/agregado a tu reserva/)).toBeInTheDocument();
  });

  it('no permite agregar un bloque que ya está ocupado', () => {
    localStorage.setItem('reservas', JSON.stringify([
      { id: 1, salaId: 1, fecha: '2026-10-20', horaInicio: '09:05', horaFin: '10:00', relator: 'Otro', actividad: 'X' },
    ]));
    renderizarSalas();
    const tarjeta = abrirFormularioSalaA();

    fireEvent.change(within(tarjeta).getByLabelText('Fecha'), { target: { value: '2026-10-20' } });
    fireEvent.change(within(tarjeta).getByLabelText('Bloque horario'), { target: { value: '1' } });
    fireEvent.change(within(tarjeta).getByLabelText('Actividad o curso'), { target: { value: 'Taller Python' } });
    fireEvent.click(within(tarjeta).getByRole('button', { name: 'Agregar a mi reserva' }));

    expect(within(tarjeta).getByText(/ya está ocupado/)).toBeInTheDocument();
    expect(localStorage.getItem('reservas_borrador')).toBeNull();
  });
});
