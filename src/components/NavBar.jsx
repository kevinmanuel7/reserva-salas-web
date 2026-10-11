import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerBorrador, EVENTO_BORRADOR } from '../services/borradorService';

export default function NavBar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [cantidadBorrador, setCantidadBorrador] = useState(obtenerBorrador().length);

  // El badge se actualiza cada vez que cambia el borrador (igual que el contador del carrito)
  useEffect(() => {
    const actualizar = () => setCantidadBorrador(obtenerBorrador().length);
    window.addEventListener(EVENTO_BORRADOR, actualizar);
    return () => window.removeEventListener(EVENTO_BORRADOR, actualizar);
  }, []);

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-semibold" to="/">THERIONLABS · Salas</Link>

        {usuario && (
          <>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
              data-bs-target="#menuPrincipal" aria-controls="menuPrincipal" aria-expanded="false"
              aria-label="Abrir menú">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="menuPrincipal">
              <ul className="navbar-nav me-auto">
                <li className="nav-item"><NavLink className="nav-link" to="/" end>Agenda</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/salas">Salas</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/mis-reservas">Mis reservas</NavLink></li>
                {usuario.rol === 'coordinador' && (
                  <li className="nav-item"><NavLink className="nav-link" to="/admin">Administración</NavLink></li>
                )}
              </ul>

              <div className="d-flex align-items-center gap-3">
                <NavLink className="nav-link text-white" to="/mi-reserva">
                  Mi reserva{' '}
                  <span className="badge bg-light text-primary" data-testid="badge-borrador">{cantidadBorrador}</span>
                </NavLink>
                <span className="navbar-text small">{usuario.nombre} ({usuario.rol})</span>
                <button className="btn btn-sm btn-outline-light" onClick={manejarCerrarSesion}>Salir</button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
