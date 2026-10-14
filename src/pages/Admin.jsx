// RESPONSABLE: Persona 2
// Administración (solo coordinador): resumen de ocupación + CRUD del catálogo de salas.
import { useState } from 'react';
import EncabezadoPagina from '../components/EncabezadoPagina';
import FormularioSala from '../components/FormularioSala';
import TablaSalas from '../components/TablaSalas';
import { obtenerSalas, crearSala, editarSala, eliminarSala } from '../services/salasService';
import { obtenerReservas } from '../services/reservasService';
import { hoyISO } from '../utils/fechas';

export default function Admin() {
  const [salas, setSalas] = useState(() => obtenerSalas());
  const [reservas] = useState(() => obtenerReservas());
  const [salaEditando, setSalaEditando] = useState(null); // null = modo "crear"
  const [mensaje, setMensaje] = useState('');

  // Datos derivados: se calculan a partir del estado en cada render
  const hoy = hoyISO();
  const reservasHoy = reservas.filter((r) => r.fecha === hoy).length;
  const futuras = reservas.filter((r) => r.fecha >= hoy);
  const reservasFuturas = futuras.reduce((conteo, r) => {
    conteo[r.salaId] = (conteo[r.salaId] ?? 0) + 1;
    return conteo;
  }, {});
  const capacidadTotal = salas.reduce((total, s) => total + s.capacidad, 0);

  // Códigos de las OTRAS salas (al editar, la sala no choca consigo misma)
  const codigosExistentes = salas.filter((s) => s.id !== salaEditando?.id).map((s) => s.codigo);

  const recargar = () => setSalas(obtenerSalas());

  const manejarGuardar = (datos) => {
    if (salaEditando) {
      editarSala(salaEditando.id, datos);
      setMensaje(`Se actualizó la sala ${datos.codigo}.`);
      setSalaEditando(null);
    } else {
      crearSala(datos);
      setMensaje(`Se creó la sala ${datos.codigo}.`);
    }
    recargar();
  };

  const manejarEliminar = (id) => {
    const sala = salas.find((s) => s.id === id);
    eliminarSala(id);
    if (salaEditando?.id === id) setSalaEditando(null);
    recargar();
    setMensaje(`Se eliminó la sala ${sala.codigo}.`);
  };

  return (
    <main className="container py-4">
      <EncabezadoPagina
        titulo="Administración"
        descripcion="Supervisa la ocupación y administra el catálogo de salas y laboratorios."
      />

      {/* Resumen de ocupación */}
      <div className="row g-3 mb-4">
        {[
          { valor: salas.length, texto: 'salas y laboratorios' },
          { valor: capacidadTotal, texto: 'personas de capacidad total' },
          { valor: reservasHoy, texto: 'reservas para hoy' },
          { valor: futuras.length, texto: 'reservas desde hoy en adelante' },
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
                reservasFuturas={reservasFuturas}
                idEditando={salaEditando?.id}
                onEditar={(sala) => { setSalaEditando(sala); setMensaje(''); }}
                onEliminar={manejarEliminar}
              />
            )}
          </div>
          <p className="small text-muted mt-2">
            Una sala con reservas próximas no se puede eliminar, para no dejar reservas sin sala.
          </p>
        </div>
      </div>
    </main>
  );
}
