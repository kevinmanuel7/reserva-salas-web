import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AgendaGrid from './AgendaGrid';

// Datos de prueba: se pasan por props, no se usa localStorage
const salas = [
  { id: 1, codigo: 'S-101', nombre: 'Sala 101', capacidad: 20, equipamiento: [] },
  { id: 2, codigo: 'LAB-01', nombre: 'Laboratorio 1', capacidad: 25, equipamiento: [] },
];
const bloques = [
  { inicio: '08:00', fin: '09:00' },
  { inicio: '09:05', fin: '10:00' },
];
const reservas = [
  { id: 1, salaId: 1, fecha: '2026-10-14', horaInicio: '08:00', horaFin: '09:00', relator: 'Ana Pérez', actividad: 'Curso Excel' },
];

describe('AgendaGrid', () => {
  it('muestra una columna por sala y una fila por bloque', () => {
    render(<AgendaGrid salas={salas} bloques={bloques} reservas={[]} />);

    expect(screen.getByText('Sala 101')).toBeInTheDocument();
    expect(screen.getByText('Laboratorio 1')).toBeInTheDocument();
    expect(screen.getByText('08:00 – 09:00')).toBeInTheDocument();
    expect(screen.getByText('09:05 – 10:00')).toBeInTheDocument();
    // 2 salas x 2 bloques = 4 celdas, todas libres
    expect(screen.getAllByText('Libre')).toHaveLength(4);
  });

  it('marca como ocupado el bloque reservado y muestra la actividad y el relator', () => {
    render(<AgendaGrid salas={salas} bloques={bloques} reservas={reservas} />);

    expect(screen.getAllByText('Ocupado')).toHaveLength(1);
    expect(screen.getByText('Curso Excel')).toBeInTheDocument();
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getAllByText('Libre')).toHaveLength(3);
  });

  it('marca los bloques que ya están en el borrador del usuario', () => {
    const borrador = [{ idTemporal: 9, salaId: 2, fecha: '2026-10-14', horaInicio: '09:05', horaFin: '10:00' }];
    render(<AgendaGrid salas={salas} bloques={bloques} reservas={[]} borrador={borrador} />);

    expect(screen.getAllByText('En tu reserva')).toHaveLength(1);
    expect(screen.getAllByText('Libre')).toHaveLength(3);
  });

  it('con onSeleccionar, los bloques libres tienen botón y avisan al padre con la sala y el bloque', () => {
    const onSeleccionar = vi.fn();
    render(<AgendaGrid salas={salas} bloques={bloques} reservas={reservas} onSeleccionar={onSeleccionar} />);

    // 4 celdas - 1 ocupada = 3 botones
    expect(screen.getAllByRole('button', { name: /^Reservar/ })).toHaveLength(3);

    fireEvent.click(screen.getByRole('button', { name: 'Reservar Laboratorio 1 de 09:05 a 10:00' }));
    expect(onSeleccionar).toHaveBeenCalledWith(salas[1], bloques[1]);
  });

  it('muestra un aviso si no hay salas', () => {
    render(<AgendaGrid salas={[]} bloques={bloques} reservas={[]} />);

    expect(screen.getByText('No hay salas registradas.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
