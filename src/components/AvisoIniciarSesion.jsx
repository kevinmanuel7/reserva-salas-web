import { Link, useLocation } from 'react-router-dom';

// Se muestra en las páginas que necesitan saber quién eres (Mis reservas, Mi reserva)
// cuando entras sin sesión. Al iniciar sesión, el Login te devuelve a esta misma página.
export default function AvisoIniciarSesion() {
  const location = useLocation();

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7 col-lg-6">
          <div className="card text-center">
            <div className="card-body p-4">
              <h1 className="h4">Esta sección es personal</h1>
              <p className="text-muted mb-4">
                Inicia sesión para ver tus reservas y confirmar las que tienes pendientes.
              </p>
              <Link className="btn btn-primary" to="/login" state={{ desde: location.pathname }}>
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}