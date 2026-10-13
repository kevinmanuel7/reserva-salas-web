// RESPONSABLE: Persona 1
// TODO:
//  - Cargar salas con obtenerSalas() (salasService) en useState.
//  - Componente FiltroSalas: capacidad mínima y equipamiento (EQUIPAMIENTOS en data/bloques.js).
//  - Componente SalaCard (props: sala, onAgregar) en grilla row g-3 / col-12 col-md-6 col-lg-4.
//  - Agregar al borrador con agregarBloque() (borradorService).

import { useState, useEffect } from 'react';
import SalaCard from '../components/SalaCard';
import { obtenerSalas } from '../services/salasService';
import { agregarBloque } from '../services/borradorService';

export default function Salas() {
  const [salas, setSalas] = useState([]);
  const [capacidadMinima, setCapacidadMinima] = useState('');
  const [equipamientoFiltro, setEquipamientoFiltro] = useState('');
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    // Cargar salas con obtenerSalas() (salasService) en useState
    const listaSalas = obtenerSalas();
    setSalas(listaSalas);
  }, []);

  const manejarAgregarBorrador = (sala) => {
    // Agregar al borrador con agregarBloque() (borradorService)
    const nuevoBloque = {
      salaId: sala.id,
      nombreSala: sala.nombre,
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '09:00',
      horaFin: '10:00',
      actividad: 'Reunión general'
    };

    try {
      agregarBloque(nuevoBloque);
      setMensaje(`Sala ${sala.nombre} agregada a los borradores.`);
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const salasFiltradas = salas.filter((sala) => {
    const cumpleCapacidad = capacidadMinima ? sala.capacidad >= Number(capacidadMinima) : true;
    const cumpleEquipamiento = equipamientoFiltro 
      ? sala.equipamiento.includes(equipamientoFiltro) 
      : true;
    return cumpleCapacidad && cumpleEquipamiento;
  });

  return (
    <main className="container py-4">
      <h1 className="h3 mb-4">Catálogo de Salas</h1>

      {mensaje && (
        <div className="alert alert-success" role="alert">
          {mensaje}
        </div>
      )}

      {/* Filtros */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <label htmlFor="capacidad" className="form-label">Capacidad mínima</label>
          <input
            type="number"
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
            <option value="proyector">Proyector</option>
            <option value="computadores">Computadores</option>
            <option value="climatizacion">Climatización</option>
          </select>
        </div>
      </div>

      {/* Grilla de SalaCard */}
      <div className="row g-3">
        {salasFiltradas.length > 0 ? (
          salasFiltradas.map((sala) => (
            <SalaCard key={sala.id} sala={sala} onAgregar={manejarAgregarBorrador} />
          ))
        ) : (
          <div className="col-12">
            <p className="text-muted text-center">No se encontraron salas con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </main>
  );
}