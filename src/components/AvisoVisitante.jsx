import { Link, useLocation } from 'react-router-dom';

// Franja que avisa que la página se ve en modo solo lectura (sin sesión)
// e invita a iniciar sesión. Al entrar, el Login devuelve a esta misma página.
export default function AvisoVisitante({ texto }) {
  const location = useLocation();

  return (
    <div className="alert alert-info d-flex flex-wrap align-items-center justify-content-between gap-2">
      <span>{texto} Para reservar, inicia sesión.</span>
      <Link className="btn btn-sm btn-primary" to="/login" state={{ desde: location.pathname }}>
        Iniciar sesión
      </Link>
    </div>
  );
}