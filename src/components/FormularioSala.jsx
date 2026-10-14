// RESPONSABLE: Persona 2
// Formulario para crear o editar una sala.
// Props:
//  - salaInicial: la sala a editar, o null para crear una nueva
//  - codigosExistentes: códigos de las otras salas (para validar que no se repitan)
//  - onGuardar(datos): el padre guarda la sala
//  - onCancelar(): el padre cierra el modo edición
import { useState } from 'react';
import { EQUIPAMIENTOS, NOMBRES_EQUIPAMIENTO } from '../data/bloques';
import { validarSala } from '../utils/validaciones';

const VACIO = { codigo: '', nombre: '', capacidad: '', equipamiento: [] };

export default function FormularioSala({ salaInicial, codigosExistentes, onGuardar, onCancelar }) {
  // Estado del formulario: parte con los datos de la sala a editar o vacío
  const [datos, setDatos] = useState(
    salaInicial ? { ...salaInicial, capacidad: String(salaInicial.capacidad) } : VACIO
  );
  const [errores, setErrores] = useState({});
  const editando = Boolean(salaInicial);

  // Un solo manejador para todos los inputs de texto, usando el atributo "name"
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setDatos((anteriores) => ({ ...anteriores, [name]: value }));
  };

  // Agrega o quita un equipamiento del arreglo
  const alternarEquipamiento = (item) => {
    setDatos((anteriores) => ({
      ...anteriores,
      equipamiento: anteriores.equipamiento.includes(item)
        ? anteriores.equipamiento.filter((e) => e !== item)
        : [...anteriores.equipamiento, item],
    }));
  };

  const manejarSubmit = (e) => {
    e.preventDefault();
    const nuevosErrores = validarSala(datos, codigosExistentes);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    onGuardar({
      codigo: datos.codigo.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      capacidad: Number(datos.capacidad),
      equipamiento: datos.equipamiento,
    });
    if (!editando) setDatos(VACIO); // al crear, deja el formulario limpio para otra sala
  };

  const claseCampo = (campo) => `form-control ${errores[campo] ? 'is-invalid' : ''}`;

  return (
    <form onSubmit={manejarSubmit} noValidate>
      <div className="mb-3">
        <label htmlFor="codigo" className="form-label">Código</label>
        <input id="codigo" name="codigo" type="text" className={claseCampo('codigo')}
          value={datos.codigo} onChange={manejarCambio} placeholder="Ej. LAB-03" />
        {errores.codigo && <div className="invalid-feedback">{errores.codigo}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="nombre" className="form-label">Nombre</label>
        <input id="nombre" name="nombre" type="text" className={claseCampo('nombre')}
          value={datos.nombre} onChange={manejarCambio} placeholder="Ej. Laboratorio de Redes" />
        {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="capacidad" className="form-label">Capacidad (personas)</label>
        <input id="capacidad" name="capacidad" type="number" min="1" className={claseCampo('capacidad')}
          value={datos.capacidad} onChange={manejarCambio} placeholder="Ej. 25" />
        {errores.capacidad && <div className="invalid-feedback">{errores.capacidad}</div>}
      </div>

      <fieldset className="mb-3">
        <legend className="form-label fs-6">Equipamiento</legend>
        {EQUIPAMIENTOS.map((item) => (
          <div className="form-check form-check-inline" key={item}>
            <input className="form-check-input" type="checkbox" id={`eq-${item}`}
              checked={datos.equipamiento.includes(item)} onChange={() => alternarEquipamiento(item)} />
            <label className="form-check-label" htmlFor={`eq-${item}`}>{NOMBRES_EQUIPAMIENTO[item]}</label>
          </div>
        ))}
      </fieldset>

      <div className="d-flex gap-2">
        {editando && (
          <button type="button" className="btn btn-outline-secondary flex-fill" onClick={onCancelar}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-warning flex-fill">
          {editando ? 'Guardar cambios' : 'Crear sala'}
        </button>
      </div>
    </form>
  );
}
