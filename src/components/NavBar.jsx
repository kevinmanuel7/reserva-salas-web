import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerBorrador, EVENTO_BORRADOR } from '../services/borradorService';

export default function NavBar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cantidadBorrador, setCantidadBorrador] = useState(obtenerBorrador().length);

  // El badge se actualiza cada vez que cambia el borrador (igual que el contador del carrito)
  useEffect(() => {
    const actualizar = () => setCantidadBorrador(obtenerBorrador().length);
    window.addEventListener(EVENTO_BORRADOR, actualizar);
    return () => window.removeEventListener(EVENTO_BORRADOR, actualizar);
  }, []);

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">THERIONLABS <span>· Salas</span></Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#menuPrincipal" aria-controls="menuPrincipal" aria-expanded="false"
          aria-label="Abrir menú">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="menuPrincipal">
          {/* Izquierda: el mismo menú con o sin sesión; Administración solo para el coordinador */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><NavLink className="nav-link" to="/" end>Inicio</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/agenda">Agenda</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/salas">Salas</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/mis-reservas">Mis reservas</NavLink></li>
            {usuario?.rol === 'COORDINADOR' && (
              <li className="nav-item"><NavLink className="nav-link" to="/admin">Administración</NavLink></li>
            )}
          </ul>

          {/* Derecha: Mi reserva siempre; con sesión, usuario + Salir; sin sesión, el botón de login */}
          <div className="d-flex align-items-center gap-3">
            <NavLink className="nav-link text-white" to="/mi-reserva">
              Mi reserva{' '}
              {usuario && (
                <span className="badge bg-light text-primary" data-testid="badge-borrador">{cantidadBorrador}</span>
              )}
            </NavLink>
            {usuario ? (
              <>
                <span className="navbar-text small">{usuario.nombre} ({usuario.rol.toLowerCase()})</span>
                <button className="btn btn-sm btn-outline-light" onClick={manejarCerrarSesion}>Salir</button>
              </>
            ) : (
              <Link className="btn btn-sm btn-warning" to="/login" state={{ desde: location.pathname }}>
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}