export default function SalaCard({ sala, onAgregar }) {
    return (
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card h-100 shadow-sm">
          <div className="card-body d-flex flex-column">
            <h5 className="card-title text-primary">{sala.nombre}</h5>
            <h6 className="card-subtitle mb-2 text-muted">Código: {sala.codigo}</h6>
            
            <p className="card-text mb-2">
              <strong>Capacidad:</strong> {sala.capacidad} personas
            </p>
  
            <div className="mb-3">
              <strong>Equipamiento:</strong>
              <div className="d-flex flex-wrap gap-1 mt-1">
                {sala.equipamiento.map((item, index) => (
                  <span key={index} className="badge bg-secondary">
                    {item}
                  </span>
                ))}
              </div>
            </div>
  
            <button
              type="button"
              className="btn btn-primary mt-auto w-100"
              onClick={() => onAgregar(sala)}
            >
              Agregar a mi reserva
            </button>
          </div>
        </div>
      </div>
    );
  }