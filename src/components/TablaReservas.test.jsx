import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import TablaReservas from './TablaReservas';

const salas = [
  { id: 1, nombre: 'Sala 101' },
  { id: 4, nombre: 'Laboratorio 1' },
];
const reservas = [
  { id: 20, salaId: 4, fecha: '2026-10-15', horaInicio: '12:00', horaFin: '13:30', actividad: 'Taller Python' },
  { id: 10, salaId: 1, fecha: '2026-10-14', horaInicio: '08:30', horaFin: '10:00', actividad: 'Curso Excel' },
];

describe('TablaReservas', () => {
  it('muestra el nombre de la sala y la fecha formateada, en orden cronológico', () => {
    render(<TablaReservas reservas={reservas} salas={salas} onCancelar={() => {}} />);

    const filas = screen.getAllByRole('row'); // fila 0 = encabezado
    expect(within(filas[1]).getByText('Sala 101')).toBeInTheDocument();
    expect(within(filas[1]).getByText('14-10-2026')).toBeInTheDocument();
    expect(within(filas[2]).getByText('Laboratorio 1')).toBeInTheDocument();
  });

  it('al presionar "Cancelar" avisa al padre con el id de la reserva', () => {
    const onCancelar = vi.fn(); // función espía: registra cómo y cuántas veces la llaman
    render(<TablaReservas reservas={reservas} salas={salas} onCancelar={onCancelar} />);

    const filaExcel = screen.getByText('Curso Excel').closest('tr');
    fireEvent.click(within(filaExcel).getByRole('button', { name: 'Cancelar' }));

    expect(onCancelar).toHaveBeenCalledTimes(1);
    expect(onCancelar).toHaveBeenCalledWith(10);
  });
});
