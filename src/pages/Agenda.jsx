import { useEffect, useState } from 'react';
import { obtenerSalas } from '../services/salasService';
import { obtenerReservasPorFecha } from '../services/reservasService';
import { hoyISO } from '../utils/fechas';
import AgendaGrid from '../components/AgendaGrid';
import { BLOQUES } from '../data/bloques';

export default function Agenda() {
  // 1) Estado: los datos que, al cambiar, hacen que React vuelva a dibujar la página
  const [fecha, setFecha] = useState(hoyISO());
  const [salas] = useState(() => obtenerSalas());
  const [reservas, setReservas] = useState([]);

  // 2) Efecto: cada vez que cambia la fecha, se cargan las reservas de ese día
  useEffect(() => {
    setReservas(obtenerReservasPorFecha(fecha));
  }, [fecha]);

  return (
    <main className="container py-4">
      <h1 className="h3 mb-4">Agenda de salas</h1>

      {/* 3) Input controlado: su valor viene del estado y onChange lo actualiza */}
      <div className="row mb-4">
        <div className="col-12 col-sm-6 col-md-4">
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

      <p className="text-muted mb-3">
        {reservas.length} reserva(s) para el {fecha}
      </p>

      <AgendaGrid salas={salas} bloques={BLOQUES} reservas={reservas} />
    </main>
  );
}