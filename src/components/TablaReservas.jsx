import { formatearFecha } from '../utils/fechas';

export default function TablaReservas({ reservas, salas, onCancelar }) {
  // Busca el nombre de la sala a partir de su id
  const nombreSala = (salaId) => salas.find((s) => s.id === salaId)?.nombre ?? 'Sala eliminada';

  // Orden cronológico: primero por fecha y luego por hora de inicio.
  // Se ordena una COPIA ([...reservas]) para no modificar la prop original.
  const ordenadas = [...reservas].sort((a, b) =>
    (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio)
  );

  return (
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
          {ordenadas.map((reserva) => (
            <tr key={reserva.id}>
              <td className="fw-semibold">{nombreSala(reserva.salaId)}</td>
              <td className="text-nowrap">{formatearFecha(reserva.fecha)}</td>
              <td className="text-nowrap">{reserva.horaInicio} – {reserva.horaFin}</td>
              <td>{reserva.actividad}</td>
              <td className="text-center">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onCancelar(reserva.id)}
                >
                  Cancelar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}