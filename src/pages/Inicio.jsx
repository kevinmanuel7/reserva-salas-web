// Portada pública: se ve sin iniciar sesión. Presenta el sistema y las salas disponibles.
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerSalas } from '../services/salasService';
import { NOMBRES_EQUIPAMIENTO } from '../data/bloques';

const PASOS = [
  { titulo: '1. Revisa la agenda', texto: 'Mira qué salas están libres en cada bloque del día.' },
  { titulo: '2. Elige tus bloques', texto: 'Agrega uno o varios bloques a tu reserva, con la actividad.' },
  { titulo: '3. Confirma', texto: 'Confirma todo junto: si un bloque choca, no se guarda ninguno.' },
];

export default function Inicio() {
  const { usuario } = useAuth();
  const salas = obtenerSalas();

  return (
    <main>
      {/* Portada */}
      <section className="bg-primary text-white py-5 mb-4">
        <div className="container">
          <h1 className="display-6 fw-bold">Reserva de salas THERIONLABS</h1>
          <p className="lead mb-4">
            Consulta la disponibilidad y reserva salas para tus cursos y talleres en pocos pasos.
          </p>
          {usuario ? (
            <Link className="btn btn-warning btn-lg" to="/agenda">Ir a la agenda</Link>
          ) : (
            <Link className="btn btn-warning btn-lg" to="/login">Iniciar sesión para reservar</Link>
          )}
        </div>
      </section>

      <div className="container">
        {/* Cómo funciona */}
        <div className="row g-3 mb-4">
          {PASOS.map((paso) => (
            <div className="col-12 col-md-4" key={paso.titulo}>
              <div className="card h-100">
                <div className="card-body">
                  <h2 className="h6 fw-bold">{paso.titulo}</h2>
                  <p className="small mb-0">{paso.texto}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Salas disponibles */}
        <h2 className="h4 mb-3">Salas disponibles</h2>
        <div className="row g-3">
          {salas.map((sala) => (
            <div className="col-12 col-sm-6 col-lg-4" key={sala.id}>
              <div className="card h-100">
                <div className="card-header">{sala.nombre}</div>
                <div className="card-body">
                  <p className="mb-2 small text-muted">{sala.codigo} · Capacidad: {sala.capacidad} personas</p>
                  <div className="d-flex flex-wrap gap-1">
                    {sala.equipamiento.map((equipo) => (
                      <span className="badge bg-light text-primary border" key={equipo}>
                        {NOMBRES_EQUIPAMIENTO[equipo]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}