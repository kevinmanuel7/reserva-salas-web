import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerSalas } from '../services/salasService';
import { obtenerReservasPorFecha } from '../services/reservasService';
import { obtenerBorrador, agregarBloque } from '../services/borradorService';
import { hoyISO, formatearFecha } from '../utils/fechas';
import AgendaGrid from '../components/AgendaGrid';
import EncabezadoPagina from '../components/EncabezadoPagina';
import { BLOQUES } from '../data/bloques';

export default function Agenda() {
  const { usuario } = useAuth();

  // Estado: fecha elegida, catálogo de salas, reservas del día y bloques en borrador
  const [fecha, setFecha] = useState(hoyISO());
  const [salas] = useState(() => obtenerSalas());
  const [reservas, setReservas] = useState([]);
  const [borrador, setBorrador] = useState([]);
  const [mensaje, setMensaje] = useState('');

  // Cada vez que cambia la fecha, se cargan las reservas y el borrador de ese día
  useEffect(() => {
    setReservas(obtenerReservasPorFecha(fecha));
    setBorrador(obtenerBorrador().filter((b) => b.fecha === fecha));
  }, [fecha]);

  // No se puede reservar en días que ya pasaron
  const esFechaPasada = fecha < hoyISO();

  // Lo llama AgendaGrid (el hijo) al presionar "Reservar" en un bloque libre
  const manejarSeleccionar = (sala, bloque) => {
    agregarBloque({
      salaId: sala.id,
      nombreSala: sala.nombre,
      fecha,
      horaInicio: bloque.inicio,
      horaFin: bloque.fin,
      relator: usuario.nombre,
      actividad: '',
    });
    setBorrador(obtenerBorrador().filter((b) => b.fecha === fecha));
    setMensaje(`${sala.nombre}, ${bloque.inicio} – ${bloque.fin} agregado a tu reserva.`);
  };

  return (
    <main className="container py-4">
      <EncabezadoPagina
        titulo="Agenda de salas"
        descripcion="Revisa la disponibilidad y reserva un bloque libre con un clic."
      />

      <div className="row g-3 mb-4">
        {/* Tarjeta: selector de fecha (input controlado) */}
        <div className="col-12 col-md-5 col-lg-4">
          <div className="card h-100">
            <div className="card-header">Seleccionar fecha</div>
            <div className="card-body">
              <label htmlFor="fecha" className="form-label">Fecha</label>
              <input
                id="fecha"
                type="date"
                className="form-control"
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setMensaje('');
                }}
              />
            </div>
          </div>
        </div>

        {/* Tarjeta: resumen del día + leyenda de colores */}
        <div className="col-12 col-md-7 col-lg-8">
          <div className="card h-100">
            <div className="card-header">Resumen del {formatearFecha(fecha)}</div>
            <div className="card-body d-flex flex-wrap align-items-center gap-4">
              <div>
                <div className="display-6 fw-bold text-primary">{reservas.length}</div>
                <div className="small text-muted">reserva(s) confirmada(s)</div>
              </div>
              <div className="d-flex flex-column gap-2 small">
                <span><span className="badge bg-danger me-1">Ocupado</span> Reservado por otro relator o curso</span>
                <span><span className="badge bg-warning text-dark me-1">En tu reserva</span> Agregado, falta confirmar</span>
                <span><span className="badge bg-success me-1">Libre</span> Presiona «Reservar» para agregarlo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {mensaje && (
        <div className="alert alert-success alert-dismissible" role="alert">
          {mensaje} Completa la actividad y confirma en{' '}
          <Link to="/mi-reserva" className="alert-link">Mi reserva</Link>.
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setMensaje('')} />
        </div>
      )}

      {esFechaPasada && (
        <div className="alert alert-secondary">
          Estás viendo una fecha pasada: solo se muestra la ocupación, no se puede reservar.
        </div>
      )}

      <AgendaGrid
        salas={salas}
        bloques={BLOQUES}
        reservas={reservas}
        borrador={borrador}
        onSeleccionar={esFechaPasada ? undefined : manejarSeleccionar}
      />
    </main>
  );
}
