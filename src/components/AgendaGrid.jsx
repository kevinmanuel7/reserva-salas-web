export default function AgendaGrid({ salas, bloques, reservas }) {
  // Caso borde: si no hay salas, se muestra un aviso en vez de una tabla vacía
  if (salas.length === 0) {
    return <div className="alert alert-info">No hay salas registradas.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover align-middle text-center">
        <thead className="table-light">
          <tr>
            <th scope="col" className="text-start">Sala</th>
            {bloques.map((bloque) => (
              <th scope="col" key={bloque.inicio} className="text-nowrap">
                {bloque.inicio} – {bloque.fin}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {salas.map((sala) => (
            <tr key={sala.id}>
              <th scope="row" className="text-start">
                <div>{sala.nombre}</div>
                <small className="text-muted">
                  {sala.codigo} · {sala.capacidad} personas
                </small>
              </th>

              {bloques.map((bloque) => (
                <td key={bloque.inicio}>
                  {/* En el paso 3 aquí se decide si está libre u ocupado usando "reservas" */}
                  <span className="badge bg-success">Libre</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}