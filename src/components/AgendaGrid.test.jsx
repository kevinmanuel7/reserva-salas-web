import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AgendaGrid from './AgendaGrid';

// Datos de prueba: se pasan por props, no se usa localStorage
const salas = [
  { id: 1, codigo: 'S-101', nombre: 'Sala 101', capacidad: 20, equipamiento: [] },
  { id: 2, codigo: 'LAB-01', nombre: 'Laboratorio 1', capacidad: 25, equipamiento: [] },
];
const bloques = [
  { inicio: '08:30', fin: '10:00' },
  { inicio: '10:15', fin: '11:45' },
];
const reservas = [
  { id: 1, salaId: 1, fecha: '2026-10-14', horaInicio: '08:30', horaFin: '10:00', relator: 'Ana Pérez', actividad: 'Curso Excel' },
];

describe('AgendaGrid', () => {
  it('muestra una fila por sala y una columna por bloque', () => {
    render(<AgendaGrid salas={salas} bloques={bloques} reservas={[]} />);

    expect(screen.getByText('Sala 101')).toBeInTheDocument();
    expect(screen.getByText('Laboratorio 1')).toBeInTheDocument();
    expect(screen.getByText('08:30 – 10:00')).toBeInTheDocument();
    expect(screen.getByText('10:15 – 11:45')).toBeInTheDocument();
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

  it('muestra un aviso si no hay salas', () => {
    render(<AgendaGrid salas={[]} bloques={bloques} reservas={[]} />);

    expect(screen.getByText('No hay salas registradas.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});