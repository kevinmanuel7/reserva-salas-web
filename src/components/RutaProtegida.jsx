import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Si no hay sesión, manda al login. Si se pide un rol y no coincide, manda al inicio.
export default function RutaProtegida({ rol, children }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (rol && usuario.rol !== rol) return <Navigate to="/" replace />;
  return children;
}
