// RESPONSABLE: Persona 1
// Tarjeta de una sala con su formulario de reserva (fecha + bloque + actividad).
// Valida los campos y le pasa los datos al padre con onAgregar.
// onAgregar(sala, datos) devuelve un mensaje de error (string) o null si se agregó bien.
import { useState } from 'react';
import { BLOQUES, NOMBRES_EQUIPAMIENTO } from '../data/bloques';
import { hoyISO } from '../utils/fechas';
import { validarBloque } from '../utils/validaciones';

export default function SalaCard({ sala, onAgregar }) {
  const [abierto, setAbierto] = useState(false);
  const [fecha, setFecha] = useState(hoyISO());
  const [indiceBloque, setIndiceBloque] = useState('');
  const [actividad, setActividad] = useState('');
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');

  const idCampo = (campo) => `${campo}-${sala.id}`; // ids únicos por tarjeta (para los label)

  const limpiarFormulario = () => {
    setIndiceBloque('');
    setActividad('');
    setErrores({});
    setErrorGeneral('');
  };

  const manejarSubmit = (e) => {
    e.preventDefault();
    const bloque = BLOQUES[indiceBloque];
    const nuevosErrores = validarBloque({ fecha, bloque, actividad }, hoyISO());
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const error = onAgregar(sala, { fecha, bloque, actividad: actividad.trim() });
    if (error) {
      setErrorGeneral(error);
      return;
    }
    limpiarFormulario();
    setAbierto(false);
  };

  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>{sala.nombre}</span>
          <span className="badge bg-warning text-dark">{sala.codigo}</span>
        </div>

        <div className="card-body d-flex flex-column">
          <p className="mb-2">
            <strong>Capacidad:</strong> {sala.capacidad} personas
          </p>

          <div className="mb-3 d-flex flex-wrap gap-1">
            {sala.equipamiento.map((item) => (
              <span key={item} className="badge rounded-pill text-bg-light border">
                {NOMBRES_EQUIPAMIENTO[item] ?? item}
              </span>
            ))}
          </div>

          {!abierto ? (
            <button type="button" className="btn btn-primary mt-auto w-100" onClick={() => setAbierto(true)}>
              Reservar esta sala
            </button>
          ) : (
            <form onSubmit={manejarSubmit} noValidate className="mt-auto border-top pt-3">
              <div className="mb-2">
                <label htmlFor={idCampo('fecha')} className="form-label small mb-1">Fecha</label>
                <input
                  id={idCampo('fecha')}
                  type="date"
                  min={hoyISO()}
                  className={`form-control form-control-sm ${errores.fecha ? 'is-invalid' : ''}`}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
                {errores.fecha && <div className="invalid-feedback">{errores.fecha}</div>}
              </div>

              <div className="mb-2">
                <label htmlFor={idCampo('bloque')} className="form-label small mb-1">Bloque horario</label>
                <select
                  id={idCampo('bloque')}
                  className={`form-select form-select-sm ${errores.bloque ? 'is-invalid' : ''}`}
                  value={indiceBloque}
                  onChange={(e) => setIndiceBloque(e.target.value)}
                >
                  <option value="">Selecciona…</option>
                  {BLOQUES.map((b, i) => (
                    <option key={b.inicio} value={i}>{b.inicio} – {b.fin}</option>
                  ))}
                </select>
                {errores.bloque && <div className="invalid-feedback">{errores.bloque}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor={idCampo('actividad')} className="form-label small mb-1">Actividad o curso</label>
                <input
                  id={idCampo('actividad')}
                  type="text"
                  className={`form-control form-control-sm ${errores.actividad ? 'is-invalid' : ''}`}
                  value={actividad}
                  onChange={(e) => setActividad(e.target.value)}
                  placeholder="Ej. Taller de Excel"
                />
                {errores.actividad && <div className="invalid-feedback">{errores.actividad}</div>}
              </div>

              {errorGeneral && <div className="alert alert-danger py-2 small">{errorGeneral}</div>}

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary flex-fill"
                  onClick={() => { limpiarFormulario(); setAbierto(false); }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-sm btn-warning flex-fill">
                  Agregar a mi reserva
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
