// RESPONSABLE: Persona 2
import { useEffect, useState } from 'react';
import { obtenerSalas } from '../services/salasService';
import { obtenerReservasPorFecha } from '../services/reservasService';
import { hoyISO } from '../utils/fechas';
import AgendaGrid from '../components/AgendaGrid';
import EncabezadoPagina from '../components/EncabezadoPagina';
import { BLOQUES } from '../data/bloques';

export default function Agenda() {
  // Estado: fecha elegida, catálogo de salas y reservas del día
  const [fecha, setFecha] = useState(hoyISO());
  const [salas] = useState(() => obtenerSalas());
  const [reservas, setReservas] = useState([]);

  // Cada vez que cambia la fecha, se cargan las reservas de ese día
  useEffect(() => {
    setReservas(obtenerReservasPorFecha(fecha));
  }, [fecha]);

  return (
    <main className="container py-4">
      <EncabezadoPagina
        titulo="Agenda de salas"
        descripcion="Disponibilidad de salas y laboratorios por bloque horario."
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
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tarjeta: resumen del día + leyenda de colores */}
        <div className="col-12 col-md-7 col-lg-8">
          <div className="card h-100">
            <div className="card-header">Resumen del día</div>
            <div className="card-body d-flex flex-wrap align-items-center gap-4">
              <div>
                <div className="display-6 fw-bold text-primary">{reservas.length}</div>
                <div className="small text-muted">reserva(s) para el {fecha}</div>
              </div>
              <div className="d-flex flex-wrap gap-3 small">
                <span><span className="badge bg-success me-1">Libre</span> Disponible para reservar</span>
                <span><span className="badge bg-danger me-1">Ocupado</span> Bloque ya reservado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AgendaGrid salas={salas} bloques={BLOQUES} reservas={reservas} />
    </main>
  );
}