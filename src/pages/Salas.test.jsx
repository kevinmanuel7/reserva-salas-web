import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import Salas from './Salas';
import * as borradorService from '../services/borradorService';

vi.mock('../services/salasService', () => ({
  obtenerSalas: () => [
    {
      id: '1',
      nombre: 'Sala A',
      codigo: 'S-01',
      capacidad: 20,
      equipamiento: ['proyector']
    },
    {
      id: '2',
      nombre: 'Sala B',
      codigo: 'S-02',
      capacidad: 5,
      equipamiento: ['climatizacion']
    }
  ]
}));

describe('Página de Salas', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('muestra la lista de salas correctamente', () => {
    render(<Salas />);
    expect(screen.getByText('Sala A')).toBeInTheDocument();
    expect(screen.getByText('Sala B')).toBeInTheDocument();
  });

  test('filtra las salas por capacidad mínima', () => {
    render(<Salas />);
    const inputCapacidad = screen.getByLabelText(/capacidad mínima/i);

    fireEvent.change(inputCapacidad, { target: { value: '15' } });

    expect(screen.getByText('Sala A')).toBeInTheDocument();
    expect(screen.queryByText('Sala B')).not.toBeInTheDocument();
  });

  test('agrega un bloque al borrador al hacer clic en el botón', () => {
    const spyAgregar = vi.spyOn(borradorService, 'agregarBloque');

    render(<Salas />);
    const botonesAgregar = screen.getAllByRole('button', { name: /agregar a mi reserva/i });

    fireEvent.click(botonesAgregar[0]);

    expect(spyAgregar).toHaveBeenCalledWith(
      expect.objectContaining({
        salaId: '1',
        nombreSala: 'Sala A'
      })
    );
  });
});