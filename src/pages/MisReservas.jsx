import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerSalas } from '../services/salasService';
import { obtenerMisReservas, cancelarReserva } from '../services/reservasService';
import EncabezadoPagina from '../components/EncabezadoPagina';
import TablaReservas from '../components/TablaReservas';

export default function MisReservas() {
  // Usuario logeado (viene del contexto global)
  const { usuario } = useAuth();

  // Estado de la página
  const [salas, setSalas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Al abrir la página: salas (para mostrar sus nombres) y mis reservas activas.
  // ms-reservas sabe quién soy por el token: no se envía el usuario.
  useEffect(() => {
    const cargar = async () => {
      try {
        const [listaSalas, misReservas] = await Promise.all([obtenerSalas(), obtenerMisReservas()]);
        setSalas(listaSalas);
        setReservas(misReservas);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // Lo llama TablaReservas (el hijo) cuando se presiona "Cancelar"
  const manejarCancelar = async (id) => {
    setMensaje('');
    setError('');
    try {
      await cancelarReserva(id);                                  // 1) PUT /reservas/{id}/cancelar
      setReservas((anteriores) => anteriores.filter((r) => r.id !== id)); // 2) se quita de la lista
      setMensaje('La reserva fue cancelada correctamente.');      // 3) se avisa al usuario
    } catch (err) {
      setError(err.message);
    }
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

      {error && <div className="alert alert-danger">{error}</div>}

      {cargando ? (
        <p className="text-muted">Cargando tus reservas…</p>
      ) : reservas.length === 0 ? (
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
