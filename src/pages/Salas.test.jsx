import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Salas from './Salas';
import { iniciarSesionDePrueba } from '../test/sesionDePrueba';
import { obtenerDisponibilidad } from '../services/reservasService';

// MOCK del catálogo (ms-salas) y de la ocupación (ms-reservas)
vi.mock('../services/salasService', () => ({
  obtenerSalas: vi.fn().mockResolvedValue([
    { id: 1, nombre: 'Sala A', codigo: 'S-01', capacidad: 20, equipamiento: ['proyector'] },
    { id: 2, nombre: 'Sala B', codigo: 'S-02', capacidad: 5, equipamiento: ['climatizacion'] },
  ]),
}));
vi.mock('../services/reservasService', () => ({
  obtenerDisponibilidad: vi.fn(),
}));

const renderizarSalas = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <Salas />
      </AuthProvider>
    </MemoryRouter>
  );

// Espera a que lleguen las salas, abre el formulario de "Sala A" y devuelve esa tarjeta
const abrirFormularioSalaA = async () => {
  const tarjeta = (await screen.findByText('Sala A')).closest('.card');
  fireEvent.click(within(tarjeta).getByRole('button', { name: 'Reservar esta sala' }));
  return tarjeta;
};

describe('Página de Salas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    obtenerDisponibilidad.mockResolvedValue([]);
    iniciarSesionDePrueba('Bastián Veas');
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 13, 12, 0)); // "hoy" = 13-10-2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra la lista de salas', async () => {
    renderizarSalas();
    expect(await screen.findByText('Sala A')).toBeInTheDocument();
    expect(screen.getByText('Sala B')).toBeInTheDocument();
  });

  it('filtra las salas por capacidad mínima', async () => {
    renderizarSalas();
    await screen.findByText('Sala A');
    fireEvent.change(screen.getByLabelText(/capacidad mínima/i), { target: { value: '15' } });

    expect(screen.getByText('Sala A')).toBeInTheDocument();
    expect(screen.queryByText('Sala B')).not.toBeInTheDocument();
  });

  it('valida el formulario: no agrega nada si faltan el bloque y la actividad', async () => {
    renderizarSalas();
    const tarjeta = await abrirFormularioSalaA();

    fireEvent.click(within(tarjeta).getByRole('button', { name: 'Agregar a mi reserva' }));

    expect(await within(tarjeta).findByText('Selecciona un bloque horario.')).toBeInTheDocument();
    expect(within(tarjeta).getByText('Indica la actividad o curso.')).toBeInTheDocument();
    expect(localStorage.getItem('reservas_borrador')).toBeNull();
  });

  it('con datos válidos revisa la ocupación y agrega el bloque al borrador', async () => {
    renderizarSalas();
    const tarjeta = await abrirFormularioSalaA();

    fireEvent.change(within(tarjeta).getByLabelText('Fecha'), { target: { value: '2026-10-20' } });
    fireEvent.change(within(tarjeta).getByLabelText('Bloque horario'), { target: { value: '1' } }); // 09:05–10:00
    fireEvent.change(within(tarjeta).getByLabelText('Actividad o curso'), { target: { value: 'Taller Python' } });
    fireEvent.click(within(tarjeta).getByRole('button', { name: 'Agregar a mi reserva' }));

    expect(await screen.findByText(/agregado a tu reserva/)).toBeInTheDocument();
    expect(obtenerDisponibilidad).toHaveBeenCalledWith('2026-10-20', 1);
    const borrador = JSON.parse(localStorage.getItem('reservas_borrador'));
    expect(borrador).toHaveLength(1);
    expect(borrador[0]).toMatchObject({
      salaId: 1, fecha: '2026-10-20', horaInicio: '09:05', horaFin: '10:00',
      actividad: 'Taller Python', relator: 'Bastián Veas',
    });
  });

  it('no permite agregar un bloque que ya está ocupado según ms-reservas', async () => {
    obtenerDisponibilidad.mockResolvedValue([
      // así lo entrega el service: con un id propio y las horas ya traducidas
      { id: 'ocupado-0', salaId: 1, fecha: '2026-10-20', horaInicio: '09:05', horaFin: '10:00' },
    ]);
    renderizarSalas();
    const tarjeta = await abrirFormularioSalaA();

    fireEvent.change(within(tarjeta).getByLabelText('Fecha'), { target: { value: '2026-10-20' } });
    fireEvent.change(within(tarjeta).getByLabelText('Bloque horario'), { target: { value: '1' } });
    fireEvent.change(within(tarjeta).getByLabelText('Actividad o curso'), { target: { value: 'Taller Python' } });
    fireEvent.click(within(tarjeta).getByRole('button', { name: 'Agregar a mi reserva' }));

    expect(await within(tarjeta).findByText(/ya está ocupado/)).toBeInTheDocument();
    expect(localStorage.getItem('reservas_borrador')).toBeNull();
  });

  it('sin sesión muestra el catálogo e invita a iniciar sesión en vez de reservar', async () => {
    localStorage.removeItem('sesion');

    renderizarSalas();

    expect(await screen.findByText('Sala A')).toBeInTheDocument();
    expect(screen.getByText(/como visitante/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reservar esta sala' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Inicia sesión para reservar' })).toHaveLength(2);
  });
});
