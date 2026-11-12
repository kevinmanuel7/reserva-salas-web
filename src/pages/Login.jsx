import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { estaVacio } from '../utils/validaciones';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState({});          // errores de cada campo
  const [errorServidor, setErrorServidor] = useState('');
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const manejarSubmit = async (e) => {
    e.preventDefault();

    // 1. Validar los campos antes de llamar al servidor.
    const nuevosErrores = {};
    if (estaVacio(email)) nuevosErrores.email = 'Ingresa tu correo';
    if (estaVacio(password)) nuevosErrores.password = 'Ingresa tu contraseña';
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    // 2. Llamar al backend. Si falla, se muestra el mensaje que envía el servidor.
    setCargando(true);
    setErrorServidor('');
    try {
      await iniciarSesion(email.trim(), password);
      navigate('/agenda');
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-5">
          <div className="card shadow-sm p-4">
            <h1 className="h4 mb-3 text-center">Iniciar sesión</h1>

            <form onSubmit={manejarSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Correo</label>
                <input
                  id="email"
                  type="email"
                  className={`form-control ${errores.email ? 'is-invalid' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="relator1@duocuc.test"
                />
                {errores.email && <div className="invalid-feedback">{errores.email}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errores.password && <div className="invalid-feedback">{errores.password}</div>}
              </div>

              {errorServidor && <div className="alert alert-danger py-2">{errorServidor}</div>}

              <button type="submit" className="btn btn-primary w-100 mt-2" disabled={cargando}>
                {cargando ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}