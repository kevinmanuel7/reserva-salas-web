// TODO: formulario con nombre + selector de rol, validación (estaVacio) y mensajes con is-invalid.
// Lo de abajo es un acceso TEMPORAL para poder navegar mientras se construye la página.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('relator');
  const [error, setError] = useState('');

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const manejarSubmit = (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setError('Ingresa tu nombre');
      return;
    }

    iniciarSesion(nombre.trim(), rol);
    navigate('/salas');
  };

  return (
    <main className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-5">
          <div className="card shadow-sm p-4">
            <h1 className="h4 mb-3 text-center">Iniciar Sesión</h1>

            <form onSubmit={manejarSubmit}>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className={`form-control ${error ? 'is-invalid' : ''}`}
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Ej. Bastián"
                />
                {error && <div className="invalid-feedback">{error}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Rol</label>
                <select
                  className="form-select"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                >
                  <option value="relator">Relator</option>
                  <option value="coordinador">Coordinador</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-100 mt-2">
                Ingresar
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}