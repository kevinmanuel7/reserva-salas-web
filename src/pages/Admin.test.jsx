import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Admin from './Admin';

const leer = (clave) => JSON.parse(localStorage.getItem(clave));

describe('Página Administración', () => {
  beforeEach(() => {
    // Catálogo inicial conocido + una reserva próxima en la sala 1
    localStorage.setItem('salas', JSON.stringify([
      { id: 1, codigo: 'S-101', nombre: 'Sala 101', capacidad: 20, equipamiento: ['proyector'] },
      { id: 2, codigo: 'S-102', nombre: 'Sala 102', capacidad: 30, equipamiento: [] },
    ]));
    localStorage.setItem('reservas', JSON.stringify([
      { id: 9, salaId: 1, fecha: '2026-10-20', horaInicio: '08:00', horaFin: '09:00', relator: 'Ana', actividad: 'Excel' },
    ]));
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 13, 12, 0)); // "hoy" = 13-10-2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('crea una sala nueva y la muestra en la tabla', () => {
    render(<Admin />);

    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'LAB-03' } });
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Laboratorio de Redes' } });
    fireEvent.change(screen.getByLabelText('Capacidad (personas)'), { target: { value: '22' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear sala' }));

    expect(screen.getByText('Se creó la sala LAB-03.')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByText('Laboratorio de Redes')).toBeInTheDocument();
    expect(leer('salas')).toHaveLength(3);
  });

  it('edita una sala existente', () => {
    render(<Admin />);

    fireEvent.click(screen.getByRole('button', { name: 'Editar Sala 102' }));
    fireEvent.change(screen.getByLabelText('Capacidad (personas)'), { target: { value: '35' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(leer('salas').find((s) => s.id === 2).capacidad).toBe(35);
    expect(screen.getByText('Se actualizó la sala S-102.')).toBeInTheDocument();
  });

  it('no permite eliminar una sala con reservas próximas', () => {
    render(<Admin />);
    expect(screen.getByRole('button', { name: 'Eliminar Sala 101' })).toBeDisabled();
  });

  it('elimina una sala sin reservas después de confirmar', () => {
    render(<Admin />);

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Sala 102' }));
    // Primero pide confirmación: todavía no se borró
    expect(leer('salas')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }));

    expect(leer('salas').map((s) => s.id)).toEqual([1]);
    expect(screen.queryByText('Sala 102')).not.toBeInTheDocument();
  });
});
