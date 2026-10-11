// RESPONSABLE: Persona 1
// TODO: formulario con nombre + selector de rol, validación (estaVacio) y mensajes con is-invalid.
// Lo de abajo es un acceso TEMPORAL para poder navegar mientras se construye la página.
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const entrarComo = (nombre, rol) => {
    iniciarSesion(nombre, rol);
    navigate('/');
  };

  return (
    <main className="container py-4">
      <h1 className="h3 mb-4">Iniciar sesión</h1>
      <div className="alert alert-warning">Acceso temporal de desarrollo (reemplazar por el formulario).</div>
      <div className="d-flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={() => entrarComo('Relator Demo', 'relator')}>
          Entrar como relator
        </button>
        <button className="btn btn-outline-secondary" onClick={() => entrarComo('Coordinador Demo', 'coordinador')}>
          Entrar como coordinador
        </button>
      </div>
    </main>
  );
}
