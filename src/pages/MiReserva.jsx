// "Mi reserva": el carrito de bloques. Aquí se completa la actividad,
// se quitan bloques y se confirman TODOS juntos (todo o nada).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EncabezadoPagina from '../components/EncabezadoPagina';
import { obtenerBorrador, quitarBloque, vaciarBorrador, actualizarBloque } from '../services/borradorService';
import { obtenerReservas, confirmarVarias } from '../services/reservasService';
import { obtenerSalas } from '../services/salasService';
import { bloquesConConflicto } from '../utils/conflictos';
import { estaVacio } from '../utils/validaciones';
import { formatearFecha, hoyISO } from '../utils/fechas';

// Orden cronológico (sobre una copia, para no modificar el arreglo original)
const ordenar = (lista) =>
  [...lista].sort((a, b) => (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio));

export default function MiReserva() {
  const { usuario } = useAuth();
  const [salas] = useState(() => obtenerSalas());
  const [bloques, setBloques] = useState(() => ordenar(obtenerBorrador()));
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [intentoConfirmar, setIntentoConfirmar] = useState(false);

  const recargar = () => setBloques(ordenar(obtenerBorrador()));
  const nombreSala = (bloque) =>
    salas.find((s) => s.id === bloque.salaId)?.nombre ?? bloque.nombreSala ?? 'Sala';

  // Se calculan en cada render a partir del estado (no necesitan su propio useState)
  const idsConConflicto = bloquesConConflicto(obtenerReservas(), bloques);
  const hoy = hoyISO();

  const manejarActividad = (idTemporal, actividad) => {
    actualizarBloque(idTemporal, { actividad });
    setBloques((anteriores) =>
      anteriores.map((b) => (b.idTemporal === idTemporal ? { ...b, actividad } : b))
    );
  };

  const manejarQuitar = (idTemporal) => {
    quitarBloque(idTemporal);
    recargar();
    setError('');
    setMensaje('Bloque quitado de tu reserva.');
  };

  const manejarVaciar = () => {
    vaciarBorrador();
    recargar();
    setError('');
    setMensaje('Se vació tu reserva.');
  };

  const manejarConfirmar = () => {
    setMensaje('');
    setIntentoConfirmar(true);

    // 1) Validaciones del formulario
    if (bloques.some((b) => estaVacio(b.actividad))) {
      setError('Completa la actividad de todos los bloques antes de confirmar.');
      return;
    }
    if (bloques.some((b) => b.fecha < hoy)) {
      setError('Hay bloques con fecha pasada. Quítalos antes de confirmar.');
      return;
    }

    // 2) Confirmación todo o nada (el service revisa los cruces de horario)
    try {
      confirmarVarias(bloques.map((b) => ({ ...b, relator: b.relator || usuario.nombre })));
      vaciarBorrador();
      recargar();
      setError('');
      setIntentoConfirmar(false);
      setMensaje('¡Reservas confirmadas con éxito!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="container py-4">
      <EncabezadoPagina
        titulo="Mi reserva"
        descripcion="Completa la actividad de cada bloque y confirma todo de una vez."
      />

      {mensaje && (
        <div className="alert alert-success alert-dismissible" role="alert">
          {mensaje}{' '}
          {mensaje.startsWith('¡Reservas') && (
            <Link to="/mis-reservas" className="alert-link">Ver mis reservas</Link>
          )}
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setMensaje('')} />
        </div>
      )}

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {bloques.length === 0 ? (
        <div className="alert alert-info">
          No tienes bloques en tu reserva. Agrégalos desde la{' '}
          <Link to="/" className="alert-link">Agenda</Link> o el{' '}
          <Link to="/salas" className="alert-link">catálogo de salas</Link>.
        </div>
      ) : (
        <div className="card">
          <div className="card-header">{bloques.length} bloque(s) por confirmar</div>
          <div className="table-responsive">
            <table className="table table-bordered tabla-duoc align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Sala</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Horario</th>
                  <th scope="col">Actividad</th>
                  <th scope="col" className="text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {bloques.map((bloque) => {
                  const choca = idsConConflicto.includes(bloque.idTemporal);
                  const pasada = bloque.fecha < hoy;
                  const sinActividad = intentoConfirmar && estaVacio(bloque.actividad);
                  return (
                    <tr key={bloque.idTemporal} className={choca || pasada ? 'table-danger' : ''}>
                      <td className="fw-semibold">
                        {nombreSala(bloque)}
                        {choca && <div><span className="badge bg-danger">Choque de horario</span></div>}
                        {pasada && <div><span className="badge bg-secondary">Fecha pasada</span></div>}
                      </td>
                      <td className="text-nowrap">{formatearFecha(bloque.fecha)}</td>
                      <td className="text-nowrap">{bloque.horaInicio} – {bloque.horaFin}</td>
                      <td style={{ minWidth: 200 }}>
                        <input
                          type="text"
                          aria-label={`Actividad para ${nombreSala(bloque)} ${bloque.horaInicio}`}
                          className={`form-control form-control-sm ${sinActividad ? 'is-invalid' : ''}`}
                          value={bloque.actividad ?? ''}
                          onChange={(e) => manejarActividad(bloque.idTemporal, e.target.value)}
                          placeholder="Ej. Taller de Excel"
                        />
                        {sinActividad && <div className="invalid-feedback">Indica la actividad.</div>}
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => manejarQuitar(bloque.idTemporal)}
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="card-body d-flex flex-wrap justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={manejarVaciar}>
              Vaciar reserva
            </button>
            <button type="button" className="btn btn-warning" onClick={manejarConfirmar}>
              Confirmar reservas
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
