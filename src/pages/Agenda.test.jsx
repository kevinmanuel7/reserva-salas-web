import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Agenda from './Agenda';
import { obtenerReservasPorFecha, obtenerDisponibilidad } from '../services/reservasService';
import { iniciarSesionDePrueba } from '../test/sesionDePrueba';

// MOCK: reemplazamos los services por funciones falsas.
// Así la prueba no depende de ms-salas ni de ms-reservas y controlamos qué "responden".
vi.mock('../services/salasService', () => ({
  obtenerSalas: vi.fn().mockResolvedValue([
    { id: 1, codigo: 'S-101', nombre: 'Sala 101', capacidad: 20, equipamiento: [] },
  ]),
}));
vi.mock('../services/reservasService', () => ({
  obtenerReservasPorFecha: vi.fn(),
  obtenerDisponibilidad: vi.fn(),
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

const RESERVA_14 = {
  id: 1, salaId: 1, fecha: '2026-10-14', horaInicio: '08:00', horaFin: '09:00', relator: 'Otro Relator', actividad: 'Curso Excel',
};

describe('Página Agenda', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    obtenerReservasPorFecha.mockResolvedValue([]);
    obtenerDisponibilidad.mockResolvedValue([]);
    iniciarSesionDePrueba('Ana Pérez');
    // Fijamos "hoy" en una fecha conocida para que la prueba no dependa del día en que se ejecuta
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 13, 12, 0)); // 13-10-2026 (los meses parten en 0)
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('al cambiar la fecha, pide las reservas de ese día (GET /reservas) y las muestra', async () => {
    obtenerReservasPorFecha.mockImplementation(async (fecha) => (fecha === '2026-10-14' ? [RESERVA_14] : []));
    renderizarAgenda();
    await screen.findByText('Sala 101');

    // Buscamos solo DENTRO de la tabla (la leyenda de arriba también dice "Ocupado")
    expect(within(screen.getByRole('table')).queryByText('Ocupado')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-10-14' } });

    const tabla = screen.getByRole('table');
    expect(await within(tabla).findByText('Ocupado')).toBeInTheDocument();
    expect(within(tabla).getByText('Curso Excel')).toBeInTheDocument();
    expect(obtenerReservasPorFecha).toHaveBeenLastCalledWith('2026-10-14');
  });

  it('al presionar "Reservar" agrega el bloque al borrador con el relator logeado', async () => {
    renderizarAgenda();

    fireEvent.click(await screen.findByRole('button', { name: 'Reservar Sala 101 de 08:00 a 09:00' }));

    const borrador = JSON.parse(localStorage.getItem('reservas_borrador'));
    expect(borrador).toHaveLength(1);
    expect(borrador[0]).toMatchObject({
      salaId: 1, fecha: '2026-10-13', horaInicio: '08:00', horaFin: '09:00', relator: 'Ana Pérez',
    });
    expect(within(screen.getByRole('table')).getByText('En tu reserva')).toBeInTheDocument();
  });

  it('en una fecha pasada no permite reservar', async () => {
    renderizarAgenda();
    await screen.findByText('Sala 101');

    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-10-01' } });

    expect(screen.queryAllByRole('button', { name: /^Reservar/ })).toHaveLength(0);
    expect(screen.getByText(/fecha pasada/)).toBeInTheDocument();
  });

  it('sin sesión usa /disponibilidad: muestra la ocupación sin detalles y no permite reservar', async () => {
    localStorage.removeItem('sesion');
    // /disponibilidad no trae relator ni actividad
    obtenerDisponibilidad.mockResolvedValue([
      { salaId: 1, fecha: '2026-10-13', horaInicio: '08:00', horaFin: '09:00' },
    ]);

    renderizarAgenda();

    const tabla = await screen.findByRole('table');
    expect(await within(tabla).findByText('Ocupado')).toBeInTheDocument();
    expect(obtenerDisponibilidad).toHaveBeenCalledWith('2026-10-13');
    expect(obtenerReservasPorFecha).not.toHaveBeenCalled();
    expect(screen.getByText(/como visitante/i)).toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: /^Reservar/ })).toHaveLength(0);
  });
});
