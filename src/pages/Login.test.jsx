import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import Login from './Login';

const renderizar = () => render(
  <AuthProvider>
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  </AuthProvider>
);

// Escribe email y contraseña y presiona "Ingresar".
const enviarFormulario = (email, password) => {
  fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
};

describe('Página de Login', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test('con campos vacíos muestra los errores y no llama al servidor', () => {
    const espiaFetch = vi.spyOn(globalThis, 'fetch');
    renderizar();

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(screen.getByText(/ingresa tu correo/i)).toBeInTheDocument();
    expect(screen.getByText(/ingresa tu contraseña/i)).toBeInTheDocument();
    expect(espiaFetch).not.toHaveBeenCalled();
  });

  test('con credenciales correctas guarda la sesión que responde el servidor', async () => {
    const sesion = {
      token: 'token-de-prueba',
      usuario: { id: 3, nombre: 'Relator Ficticio Uno', email: 'relator1@duocuc.test', rol: 'RELATOR' },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(sesion), { status: 200 }));
    renderizar();

    enviarFormulario('relator1@duocuc.test', 'clave-de-prueba');

    // Espera a que termine el login (es asíncrono) y revisa lo guardado.
    await vi.waitFor(() => expect(JSON.parse(localStorage.getItem('sesion'))).toEqual(sesion));
  });

  test('con credenciales incorrectas muestra el mensaje del servidor y no guarda sesión', async () => {
    const error = { codigo: 'CREDENCIALES_INVALIDAS', mensaje: 'Correo o contraseña incorrectos' };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(error), { status: 401 }));
    renderizar();

    enviarFormulario('relator1@duocuc.test', 'incorrecta');

    expect(await screen.findByText('Correo o contraseña incorrectos')).toBeInTheDocument();
    expect(localStorage.getItem('sesion')).toBeNull();
  });
});