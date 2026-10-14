// RESPONSABLE: Persona 1
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SalaCard from '../components/SalaCard';
import EncabezadoPagina from '../components/EncabezadoPagina';
import { obtenerSalas } from '../services/salasService';
import { obtenerReservas } from '../services/reservasService';
import { obtenerBorrador, agregarBloque } from '../services/borradorService';
import { bloqueDisponible } from '../utils/conflictos';
import { formatearFecha } from '../utils/fechas';
import { EQUIPAMIENTOS, NOMBRES_EQUIPAMIENTO } from '../data/bloques';

export default function Salas() {
  const { usuario } = useAuth();
  const [salas] = useState(() => obtenerSalas());
  const [capacidadMinima, setCapacidadMinima] = useState('');
  const [equipamientoFiltro, setEquipamientoFiltro] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Lo llama SalaCard (el hijo) con los datos ya validados del formulario.
  // Devuelve un mensaje de error si el bloque no está disponible, o null si se agregó.
  const manejarAgregar = (sala, { fecha, bloque, actividad }) => {
    const nuevo = {
      salaId: sala.id,
      nombreSala: sala.nombre,
      fecha,
      horaInicio: bloque.inicio,
      horaFin: bloque.fin,
      relator: usuario.nombre,
      actividad,
    };

    if (!bloqueDisponible(obtenerReservas(), obtenerBorrador(), nuevo)) {
      return 'Ese bloque ya está ocupado o ya está en tu reserva. Elige otro horario.';
    }

    agregarBloque(nuevo);
    setMensaje(`${sala.nombre} el ${formatearFecha(fecha)}, ${bloque.inicio} – ${bloque.fin}, agregado a tu reserva.`);
    return null;
  };

  const salasFiltradas = salas.filter((sala) => {
    const cumpleCapacidad = capacidadMinima ? sala.capacidad >= Number(capacidadMinima) : true;
    const cumpleEquipamiento = equipamientoFiltro ? sala.equipamiento.includes(equipamientoFiltro) : true;
    return cumpleCapacidad && cumpleEquipamiento;
  });

  return (
    <main className="container py-4">
      <EncabezadoPagina
        titulo="Catálogo de salas"
        descripcion="Filtra por capacidad o equipamiento y reserva un bloque horario."
      />

      {mensaje && (
        <div className="alert alert-success alert-dismissible" role="alert">
          {mensaje} Revisa y confirma en <Link to="/mi-reserva" className="alert-link">Mi reserva</Link>.
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setMensaje('')} />
        </div>
      )}

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-header">Filtrar salas</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="capacidad" className="form-label">Capacidad mínima</label>
              <input
                type="number"
                min="1"
                id="capacidad"
                className="form-control"
                value={capacidadMinima}
                onChange={(e) => setCapacidadMinima(e.target.value)}
                placeholder="Ej. 10"
              />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="equipamiento" className="form-label">Equipamiento</label>
              <select
                id="equipamiento"
                className="form-select"
                value={equipamientoFiltro}
                onChange={(e) => setEquipamientoFiltro(e.target.value)}
              >
                <option value="">Todos</option>
                {EQUIPAMIENTOS.map((eq) => (
                  <option key={eq} value={eq}>{NOMBRES_EQUIPAMIENTO[eq]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grilla de SalaCard */}
      <div className="row g-3">
        {salasFiltradas.length > 0 ? (
          salasFiltradas.map((sala) => (
            <SalaCard key={sala.id} sala={sala} onAgregar={manejarAgregar} />
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-info">No se encontraron salas con los filtros seleccionados.</div>
          </div>
        )}
      </div>
    </main>
  );
}
