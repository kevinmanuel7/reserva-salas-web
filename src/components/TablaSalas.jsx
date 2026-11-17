// Tabla del catálogo de salas para el coordinador.
// Props:
//  - salas: catálogo completo (activas e inactivas)
//  - idEditando: id de la sala que se está editando (se resalta la fila)
//  - onEditar(sala), onDesactivar(id), onReactivar(sala): avisan al padre
// "Desactivar" es la baja lógica del contrato (DELETE /salas/{id}): la sala deja de
// aparecer para reservar, pero no se borra, así sus reservas pasadas siguen teniendo sala.
import { useState } from 'react';
import { NOMBRES_EQUIPAMIENTO, TIPOS_SALA } from '../data/bloques';

export default function TablaSalas({ salas, idEditando, onEditar, onDesactivar, onReactivar }) {
  // Id de la sala que está esperando confirmación para desactivarse
  const [porDesactivar, setPorDesactivar] = useState(null);

  return (
    <div className="table-responsive">
      <table className="table table-bordered tabla-duoc align-middle mb-0">
        <thead>
          <tr>
            <th scope="col">Código</th>
            <th scope="col">Nombre</th>
            <th scope="col">Tipo</th>
            <th scope="col" className="text-center">Capacidad</th>
            <th scope="col">Equipamiento</th>
            <th scope="col" className="text-center">Estado</th>
            <th scope="col" className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {salas.map((sala) => (
            <tr key={sala.id} className={sala.id === idEditando ? 'table-warning' : ''}>
              <td className="fw-semibold text-nowrap">{sala.codigo}</td>
              <td>{sala.nombre}</td>
              <td className="small">{TIPOS_SALA[sala.tipo] ?? sala.tipo}</td>
              <td className="text-center">{sala.capacidad}</td>
              <td>
                <div className="d-flex flex-wrap gap-1">
                  {sala.equipamiento.length === 0 && <span className="text-muted small">—</span>}
                  {sala.equipamiento.map((item) => (
                    <span key={item} className="badge chip-equipo">
                      {NOMBRES_EQUIPAMIENTO[item] ?? item}
                    </span>
                  ))}
                </div>
              </td>
              <td className="text-center">
                {sala.activa
                  ? <span className="badge chip-libre">Activa</span>
                  : <span className="badge chip-ocupado">Inactiva</span>}
              </td>
              <td className="text-center text-nowrap">
                {porDesactivar === sala.id ? (
                  <>
                    <span className="small me-2">¿Desactivar?</span>
                    <button type="button" className="btn btn-sm btn-danger me-1"
                      onClick={() => { onDesactivar(sala.id); setPorDesactivar(null); }}>
                      Sí, desactivar
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-secondary"
                      onClick={() => setPorDesactivar(null)}>
                      No
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn btn-sm btn-outline-primary me-1"
                      aria-label={`Editar ${sala.nombre}`} onClick={() => onEditar(sala)}>
                      Editar
                    </button>
                    {sala.activa ? (
                      <button type="button" className="btn btn-sm btn-outline-danger"
                        aria-label={`Desactivar ${sala.nombre}`} onClick={() => setPorDesactivar(sala.id)}>
                        Desactivar
                      </button>
                    ) : (
                      <button type="button" className="btn btn-sm btn-outline-secondary"
                        aria-label={`Reactivar ${sala.nombre}`} onClick={() => onReactivar(sala)}>
                        Reactivar
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
