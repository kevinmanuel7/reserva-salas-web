import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Admin from './Admin';
import { obtenerSalas, crearSala, editarSala, desactivarSala } from '../services/salasService';
import { obtenerReservasPorFecha } from '../services/reservasService';

// MOCK de los services: la prueba no llama a ms-salas ni a ms-reservas,
// solo revisa que la página pida lo correcto y muestre lo que le responden.
vi.mock('../services/salasService', () => ({
  obtenerSalas: vi.fn(),
  crearSala: vi.fn(),
  editarSala: vi.fn(),
  desactivarSala: vi.fn(),
}));
vi.mock('../services/reservasService', () => ({
  obtenerReservasPorFecha: vi.fn(),
}));

const SALA_101 = { id: 1, codigo: 'S-101', nombre: 'Sala 101', tipo: 'SALA_CLASES', capacidad: 20, equipamiento: ['proyector'], activa: true };
const SALA_102 = { id: 2, codigo: 'S-102', nombre: 'Sala 102', tipo: 'SALA_CLASES', capacidad: 30, equipamiento: [], activa: false };

describe('Página Administración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    obtenerSalas.mockResolvedValue([SALA_101, SALA_102]);
    obtenerReservasPorFecha.mockResolvedValue([{ id: 9 }, { id: 10 }]);
  });

  it('pide todas las salas (también inactivas) y muestra el resumen', async () => {
    render(<Admin />);

    expect(await screen.findByText('Sala 101')).toBeInTheDocument();
    expect(obtenerSalas).toHaveBeenCalledWith({ incluirInactivas: true });
    expect(screen.getByText('reservas para hoy').previousSibling).toHaveTextContent('2');
    expect(screen.getByText('salas inactivas').previousSibling).toHaveTextContent('1');
  });

  it('crea una sala nueva con POST y muestra el mensaje', async () => {
    crearSala.mockResolvedValue({});
    render(<Admin />);
    await screen.findByText('Sala 101');

    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'LAB-03' } });
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Laboratorio de Redes' } });
    fireEvent.change(screen.getByLabelText('Capacidad (personas)'), { target: { value: '22' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear sala' }));

    expect(await screen.findByText('Se creó la sala LAB-03.')).toBeInTheDocument();
    expect(crearSala).toHaveBeenCalledWith(expect.objectContaining({ codigo: 'LAB-03', capacidad: 22 }));
  });

  it('edita una sala existente y conserva si estaba activa', async () => {
    editarSala.mockResolvedValue({});
    render(<Admin />);
    await screen.findByText('Sala 101');

    fireEvent.click(screen.getByRole('button', { name: 'Editar Sala 101' }));
    fireEvent.change(screen.getByLabelText('Capacidad (personas)'), { target: { value: '35' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Se actualizó la sala S-101.')).toBeInTheDocument();
    expect(editarSala).toHaveBeenCalledWith(1, expect.objectContaining({ capacidad: 35, activa: true }));
  });

  it('desactiva una sala activa solo después de confirmar', async () => {
    desactivarSala.mockResolvedValue({});
    render(<Admin />);
    await screen.findByText('Sala 101');

    fireEvent.click(screen.getByRole('button', { name: 'Desactivar Sala 101' }));
    expect(desactivarSala).not.toHaveBeenCalled(); // primero pide confirmación

    fireEvent.click(screen.getByRole('button', { name: 'Sí, desactivar' }));

    expect(await screen.findByText('Se desactivó la sala S-101.')).toBeInTheDocument();
    expect(desactivarSala).toHaveBeenCalledWith(1);
  });

  it('una sala inactiva se puede reactivar', async () => {
    editarSala.mockResolvedValue({});
    render(<Admin />);
    await screen.findByText('Sala 102');

    const fila = screen.getByText('Sala 102').closest('tr');
    expect(within(fila).getByText('Inactiva')).toBeInTheDocument();
    fireEvent.click(within(fila).getByRole('button', { name: 'Reactivar Sala 102' }));

    expect(await screen.findByText('Se reactivó la sala S-102.')).toBeInTheDocument();
    expect(editarSala).toHaveBeenCalledWith(2, expect.objectContaining({ activa: true }));
  });

  it('si el backend responde un error, lo muestra', async () => {
    crearSala.mockRejectedValue(new Error('No tienes permiso para realizar esta acción'));
    render(<Admin />);
    await screen.findByText('Sala 101');

    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'LAB-09' } });
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Lab 9' } });
    fireEvent.change(screen.getByLabelText('Capacidad (personas)'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear sala' }));

    expect(await screen.findByText('No tienes permiso para realizar esta acción')).toBeInTheDocument();
  });
});
