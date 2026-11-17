// Administración (solo coordinador): resumen + CRUD del catálogo de salas contra ms-salas.
import { useEffect, useState } from 'react';
import EncabezadoPagina from '../components/EncabezadoPagina';
import FormularioSala from '../components/FormularioSala';
import TablaSalas from '../components/TablaSalas';
import { obtenerSalas, crearSala, editarSala, desactivarSala } from '../services/salasService';
import { obtenerReservasPorFecha } from '../services/reservasService';
import { hoyISO } from '../utils/fechas';

export default function Admin() {
  const [salas, setSalas] = useState([]);
  const [reservasHoy, setReservasHoy] = useState(0);
  const [salaEditando, setSalaEditando] = useState(null); // null = modo "crear"
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // El coordinador ve TODAS las salas, también las inactivas (GET /salas?incluirInactivas=true)
  const recargar = async () => setSalas(await obtenerSalas({ incluirInactivas: true }));

  useEffect(() => {
    const cargar = async () => {
      try {
        await recargar();
        setReservasHoy((await obtenerReservasPorFecha(hoyISO())).length);
      } catch (err) {
        setError(err.message);
      }
    };
    cargar();
  }, []);

  // Datos derivados: se calculan a partir del estado en cada render
  const activas = salas.filter((s) => s.activa);
  const capacidadTotal = activas.reduce((total, s) => total + s.capacidad, 0);

  // Códigos de las OTRAS salas (al editar, la sala no choca consigo misma)
  const codigosExistentes = salas.filter((s) => s.id !== salaEditando?.id).map((s) => s.codigo);

  // Ejecuta una operación contra ms-salas, muestra el resultado y recarga la tabla.
  // Devuelve true si salió bien (el formulario lo usa para limpiarse).
  const operar = async (accion, textoExito) => {
    setMensaje('');
    setError('');
    try {
      await accion();
      await recargar();
      setMensaje(textoExito);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const manejarGuardar = async (datos) => {
    if (salaEditando) {
      // Se mantiene el estado activa/inactiva que tenía la sala
      const guardado = await operar(
        () => editarSala(salaEditando.id, { ...datos, activa: salaEditando.activa }),
        `Se actualizó la sala ${datos.codigo}.`
      );
      if (guardado) setSalaEditando(null);
      return guardado;
    }
    return operar(() => crearSala(datos), `Se creó la sala ${datos.codigo}.`);
  };

  const manejarDesactivar = (id) => {
    const sala = salas.find((s) => s.id === id);
    if (salaEditando?.id === id) setSalaEditando(null);
    return operar(() => desactivarSala(id), `Se desactivó la sala ${sala.codigo}.`);
  };

  const manejarReactivar = (sala) =>
    operar(() => editarSala(sala.id, { ...sala, activa: true }), `Se reactivó la sala ${sala.codigo}.`);

  return (
    <main className="container py-4">
      <EncabezadoPagina
        titulo="Administración"
        descripcion="Supervisa la ocupación y administra el catálogo de salas y laboratorios."
      />

      {/* Resumen */}
      <div className="row g-3 mb-4">
        {[
          { valor: activas.length, texto: 'salas activas' },
          { valor: capacidadTotal, texto: 'personas de capacidad total' },
          { valor: reservasHoy, texto: 'reservas para hoy' },
          { valor: salas.length - activas.length, texto: 'salas inactivas' },
        ].map((dato) => (
          <div className="col-6 col-lg-3" key={dato.texto}>
            <div className="card h-100">
              <div className="card-body">
                <div className="display-6 fw-bold text-primary">{dato.valor}</div>
                <div className="small text-muted">{dato.texto}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mensaje && (
        <div className="alert alert-success alert-dismissible" role="alert">
          {mensaje}
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setMensaje('')} />
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        {/* Formulario crear / editar */}
        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-header">
              {salaEditando ? `Editar sala ${salaEditando.codigo}` : 'Nueva sala'}
            </div>
            <div className="card-body">
              {/* "key" hace que el formulario se reinicie al cambiar de sala */}
              <FormularioSala
                key={salaEditando?.id ?? 'nueva'}
                salaInicial={salaEditando}
                codigosExistentes={codigosExistentes}
                onGuardar={manejarGuardar}
                onCancelar={() => setSalaEditando(null)}
              />
            </div>
          </div>
        </div>

        {/* Catálogo */}
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-header">Catálogo de salas ({salas.length})</div>
            {salas.length === 0 ? (
              <div className="card-body">
                <div className="alert alert-info mb-0">No hay salas registradas. Crea la primera con el formulario.</div>
              </div>
            ) : (
              <TablaSalas
                salas={salas}
                idEditando={salaEditando?.id}
                onEditar={(sala) => { setSalaEditando(sala); setMensaje(''); }}
                onDesactivar={manejarDesactivar}
                onReactivar={manejarReactivar}
              />
            )}
          </div>
          <p className="small text-muted mt-2">
            Desactivar una sala no la borra: deja de aparecer para reservar, pero sus reservas pasadas se conservan.
          </p>
        </div>
      </div>
    </main>
  );
}
