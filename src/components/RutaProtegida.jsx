import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AvisoIniciarSesion from './AvisoIniciarSesion';

// Sin sesión, muestra el aviso para iniciar sesión (en vez de la página).
// Si se pide un rol y no coincide, manda al inicio.
export default function RutaProtegida({ rol, children }) {
  const { usuario } = useAuth();
  if (!usuario) return <AvisoIniciarSesion />;
  if (rol && usuario.rol !== rol) return <Navigate to="/" replace />;
  return children;
}