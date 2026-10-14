// src/pages/Login.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from './Login';
import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('Página de Login', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('muestra error si el campo nombre está vacío', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthProvider>
    );

    const botonSubmit = screen.getByRole('button', { name: /ingresar/i });
    fireEvent.click(botonSubmit);

    expect(screen.getByText(/ingresa tu nombre/i)).toBeInTheDocument();
  });

  test('guarda el usuario en localStorage al iniciar sesión', () => {
    const spySetItem = vi.spyOn(Storage.prototype, 'setItem');

    render(
      <AuthProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthProvider>
    );

    const inputNombre = screen.getByPlaceholderText(/ej. bastián/i);
    const botonSubmit = screen.getByRole('button', { name: /ingresar/i });

    fireEvent.change(inputNombre, { target: { value: 'Bastián Veas' } });
    fireEvent.click(botonSubmit);

    expect(spySetItem).toHaveBeenCalledWith(
      'usuario',
      JSON.stringify({ nombre: 'Bastián Veas', rol: 'relator' })
    );
  });
});