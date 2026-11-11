import { createContext, useContext, useEffect, useState } from 'react';
import {
  pedir, URL_USUARIOS, obtenerSesion, guardarSesion, borrarSesion, EVENTO_SESION_EXPIRADA,
} from '../services/api';

const AuthContext = createContext(null);

// Sesión del usuario logeado.
// usuario = { id, nombre, email, rol: 'RELATOR' | 'COORDINADOR' } o null si no hay sesión.
export function AuthProvider({ children }) {
  // (1) Al abrir la página, recupera la sesión guardada (si existe).
  const [usuario, setUsuario] = useState(() => obtenerSesion()?.usuario ?? null);

  // (2) Si api.js avisa que el token venció, se cierra la sesión en pantalla.
  useEffect(() => {
    const alExpirar = () => setUsuario(null);
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
  }, []);

  // (3) Login real contra ms-usuarios. Si falla, pedir() lanza un ErrorApi
  //     y el Login muestra su mensaje.
  const iniciarSesion = async (email, password) => {
    const sesion = await pedir(`${URL_USUARIOS}/api/v1/auth/login`, {
      metodo: 'POST',
      cuerpo: { email, password },
    });
    guardarSesion(sesion);
    setUsuario(sesion.usuario);
    return sesion.usuario;
  };

  const cerrarSesion = () => {
    borrarSesion();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);