import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FormularioSala from './FormularioSala';

describe('FormularioSala', () => {
  it('muestra errores y NO llama a onGuardar si los datos no son válidos', () => {
    const onGuardar = vi.fn();
    render(<FormularioSala salaInicial={null} codigosExistentes={['S-101']} onGuardar={onGuardar} />);

    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 's-101' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear sala' }));

    expect(screen.getByText('Ya existe una sala con ese código.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa el nombre de la sala.')).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it('con datos válidos entrega la sala normalizada al padre', () => {
    const onGuardar = vi.fn();
    render(<FormularioSala salaInicial={null} codigosExistentes={[]} onGuardar={onGuardar} />);

    fireEvent.change(screen.getByLabelText('Código'), { target: { value: ' lab-03 ' } });
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Laboratorio de Redes' } });
    fireEvent.change(screen.getByLabelText('Capacidad (personas)'), { target: { value: '22' } });
    fireEvent.click(screen.getByLabelText('Proyector'));
    fireEvent.click(screen.getByRole('button', { name: 'Crear sala' }));

    expect(onGuardar).toHaveBeenCalledWith({
      codigo: 'LAB-03', nombre: 'Laboratorio de Redes', capacidad: 22, equipamiento: ['proyector'],
    });
  });

  it('en modo edición parte con los datos de la sala', () => {
    const sala = { id: 1, codigo: 'S-101', nombre: 'Sala 101', capacidad: 20, equipamiento: ['climatizacion'] };
    render(<FormularioSala salaInicial={sala} codigosExistentes={[]} onGuardar={() => {}} onCancelar={() => {}} />);

    expect(screen.getByLabelText('Nombre')).toHaveValue('Sala 101');
    expect(screen.getByLabelText('Capacidad (personas)')).toHaveValue(20);
    expect(screen.getByLabelText('Climatización')).toBeChecked();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
  });
});
