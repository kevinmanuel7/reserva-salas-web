import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerSalas } from '../services/salasService';
import { obtenerReservasPorRelator, cancelarReserva } from '../services/reservasService';
import EncabezadoPagina from '../components/EncabezadoPagina';
import TablaReservas from '../components/TablaReservas';

export default function MisReservas() {
  // Usuario logeado (viene del contexto global)
  const { usuario } = useAuth();

  // Estado de la página
  const [salas] = useState(() => obtenerSalas());
  const [reservas, setReservas] = useState(() => obtenerReservasPorRelator(usuario.nombre));
  const [mensaje, setMensaje] = useState('');

  // Lo llama TablaReservas (el hijo) cuando se presiona "Cancelar"
  const manejarCancelar = (id) => {
    cancelarReserva(id);                                     // 1) se elimina en el service
    setReservas(obtenerReservasPorRelator(usuario.nombre));  // 2) se actualiza el estado
    setMensaje('La reserva fue cancelada correctamente.');   // 3) se avisa al usuario
  };

  return (
    <main className="container py-4">
      <EncabezadoPagina
        titulo="Mis reservas"
        descripcion={`Reservas confirmadas de ${usuario.nombre}.`}
      />

      {mensaje && (
        <div className="alert alert-success alert-dismissible" role="alert">
          {mensaje}
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setMensaje('')} />
        </div>
      )}

      {reservas.length === 0 ? (
        <div className="alert alert-info">
          No tienes reservas confirmadas. <Link to="/salas" className="alert-link">Buscar una sala</Link>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            {reservas.length} reserva(s) confirmada(s)
          </div>
          <TablaReservas reservas={reservas} salas={salas} onCancelar={manejarCancelar} />
        </div>
      )}
    </main>
  );
}