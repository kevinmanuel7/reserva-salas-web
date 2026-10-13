// RESPONSABLE: Persona 1
// TODO:
//  - Listar obtenerBorrador() (el "carrito").
//  - Por bloque: fecha, horario (BLOQUES) y actividad; validar con horarioValido / estaVacio.
//  - Quitar con quitarBloque(); confirmar cada bloque con confirmarReserva() y luego vaciarBorrador().
//  - Mostrar errores de cruce (confirmarReserva lanza Error) con alert alert-danger.

import { useState, useEffect } from 'react';
import { obtenerBorrador, quitarBloque, vaciarBorrador } from '../services/borradorService';
import { confirmarReserva } from '../services/reservasService';

export default function MiReserva() {
  const [bloques, setBloques] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarBorrador();
  }, []);

  const cargarBorrador = () => {
    setBloques(obtenerBorrador());
  };

  const manejarQuitar = (index) => {
    quitarBloque(index);
    cargarBorrador();
    setMensaje('Bloque eliminado del borrador.');
    setTimeout(() => setMensaje(null), 3000);
  };

  const manejarConfirmarTodo = () => {
    setError(null);
    try {
      bloques.forEach((bloque) => {
        confirmarReserva(bloque);
      });
      vaciarBorrador();
      cargarBorrador();
      setMensaje('¡Reservas confirmadas con éxito!');
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setError(err.message || 'Error al confirmar las reservas por conflicto de horario.');
    }
  };

  return (
    <main className="container py-4">
      <h1 className="h3 mb-4">Mi Reserva (Borrador)</h1>

      {mensaje && (
        <div className="alert alert-success" role="alert">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {bloques.length > 0 ? (
        <>
          <div className="table-responsive mb-4">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Sala</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Actividad</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bloques.map((bloque, index) => (
                  <tr key={index}>
                    <td>{bloque.nombreSala}</td>
                    <td>{bloque.fecha}</td>
                    <td>{bloque.horaInicio} - {bloque.horaFin}</td>
                    <td>{bloque.actividad}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => manejarQuitar(index)}
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                vaciarBorrador();
                cargarBorrador();
              }}
            >
              Vaciar Borrador
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={manejarConfirmarTodo}
            >
              Confirmar Reservas
            </button>
          </div>
        </>
      ) : (
        <p className="text-muted">No tienes bloques en borrador actualmente. Ve al catálogo de salas para agregar algunos.</p>
      )}
    </main>
  );
}