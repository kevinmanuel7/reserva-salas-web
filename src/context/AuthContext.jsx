import { createContext, useContext, useState } from 'react';
import { leer, guardar, eliminar } from '../services/storage';

const AuthContext = createContext(null);

// Guarda quién está logeado: { nombre, rol: 'relator' | 'coordinador' }
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => leer('usuario', null));

  const iniciarSesion = (nombre, rol) => {
    const nuevo = { nombre: nombre.trim(), rol };
    guardar('usuario', nuevo);
    setUsuario(nuevo);
  };

  const cerrarSesion = () => {
    eliminar('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
