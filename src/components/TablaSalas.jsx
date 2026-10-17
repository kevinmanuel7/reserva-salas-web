// Tabla del catálogo de salas para el coordinador.
// Props:
//  - salas: catálogo
//  - reservasFuturas: { [salaId]: cantidad } reservas desde hoy en adelante por sala
//  - idEditando: id de la sala que se está editando (se resalta la fila)
//  - onEditar(sala), onEliminar(id): avisan al padre
import { useState } from 'react';
import { NOMBRES_EQUIPAMIENTO } from '../data/bloques';

export default function TablaSalas({ salas, reservasFuturas, idEditando, onEditar, onEliminar }) {
  // Id de la sala que está esperando confirmación para eliminarse
  const [porEliminar, setPorEliminar] = useState(null);

  return (
    <div className="table-responsive">
      <table className="table table-bordered tabla-duoc align-middle mb-0">
        <thead>
          <tr>
            <th scope="col">Código</th>
            <th scope="col">Nombre</th>
            <th scope="col" className="text-center">Capacidad</th>
            <th scope="col">Equipamiento</th>
            <th scope="col" className="text-center">Reservas próximas</th>
            <th scope="col" className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {salas.map((sala) => {
            const futuras = reservasFuturas[sala.id] ?? 0;
            return (
              <tr key={sala.id} className={sala.id === idEditando ? 'table-warning' : ''}>
                <td className="fw-semibold text-nowrap">{sala.codigo}</td>
                <td>{sala.nombre}</td>
                <td className="text-center">{sala.capacidad}</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    {sala.equipamiento.length === 0 && <span className="text-muted small">—</span>}
                    {sala.equipamiento.map((item) => (
                      <span key={item} className="badge rounded-pill text-bg-light border">
                        {NOMBRES_EQUIPAMIENTO[item] ?? item}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="text-center">{futuras}</td>
                <td className="text-center text-nowrap">
                  {porEliminar === sala.id ? (
                    <>
                      <span className="small me-2">¿Eliminar?</span>
                      <button type="button" className="btn btn-sm btn-danger me-1"
                        onClick={() => { onEliminar(sala.id); setPorEliminar(null); }}>
                        Sí, eliminar
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-secondary"
                        onClick={() => setPorEliminar(null)}>
                        No
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="btn btn-sm btn-outline-primary me-1"
                        aria-label={`Editar ${sala.nombre}`} onClick={() => onEditar(sala)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger"
                        aria-label={`Eliminar ${sala.nombre}`}
                        disabled={futuras > 0}
                        title={futuras > 0 ? 'Tiene reservas próximas: no se puede eliminar' : undefined}
                        onClick={() => setPorEliminar(sala.id)}>
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
