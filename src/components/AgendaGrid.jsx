// Tabla de la agenda de un día: filas = bloques horarios, columnas = salas.
// No carga datos ni maneja estado: todo lo recibe por props desde la página Agenda.
//
// Props:
//  - salas, bloques, reservas: datos a mostrar (reservas ya filtradas por fecha)
//  - borrador: bloques que el usuario ya agregó a "Mi reserva" para esa fecha
//  - onSeleccionar(sala, bloque): si viene, los bloques libres muestran un botón "Reservar"
import { reservaEnBloque } from '../utils/agenda';

export default function AgendaGrid({ salas, bloques, reservas, borrador = [], onSeleccionar }) {
  // Caso borde: si no hay salas, se muestra un aviso en vez de una tabla vacía
  if (salas.length === 0) {
    return <div className="alert alert-info">No hay salas registradas.</div>;
  }

  // Decide qué mostrar en una celda (sala + bloque)
  const renderCelda = (sala, bloque) => {
    const reserva = reservaEnBloque(reservas, sala.id, bloque);
    if (reserva) {
      return (
        <>
          <span className="badge bg-danger">Ocupado</span>
          <div className="small mt-1">{reserva.actividad}</div>
          <div className="small text-muted">{reserva.relator}</div>
        </>
      );
    }

    if (reservaEnBloque(borrador, sala.id, bloque)) {
      return <span className="badge bg-warning text-dark">En tu reserva</span>;
    }

    if (onSeleccionar) {
      return (
        <button
          type="button"
          className="btn btn-sm btn-outline-success"
          aria-label={`Reservar ${sala.nombre} de ${bloque.inicio} a ${bloque.fin}`}
          onClick={() => onSeleccionar(sala, bloque)}
        >
          Reservar
        </button>
      );
    }

    return <span className="badge bg-success">Libre</span>;
  };

  return (
    <div className="table-responsive">
      <table className="table table-bordered tabla-duoc tabla-agenda align-middle text-center mb-0">
        <thead>
          <tr>
            <th scope="col" className="text-nowrap">Bloque</th>
            {salas.map((sala) => (
              <th scope="col" key={sala.id}>
                <div>{sala.nombre}</div>
                <small className="fw-normal text-none">{sala.codigo} · {sala.capacidad} pers.</small>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {bloques.map((bloque) => (
            <tr key={bloque.inicio}>
              <th scope="row" className="text-nowrap">
                {bloque.inicio} – {bloque.fin}
              </th>
              {salas.map((sala) => (
                <td key={sala.id}>{renderCelda(sala, bloque)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
