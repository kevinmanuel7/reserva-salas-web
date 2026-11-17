// Salas: se leen y modifican en ms-salas (puerto 8082 en local).
// La API describe el equipamiento con tres campos (tieneProyector, tieneComputadores,
// tieneClimatizacion), pero las páginas trabajan con una lista: equipamiento: ['proyector', ...].
// Este archivo hace la traducción en los dos sentidos, así las páginas no cambian.
import { pedir, URL_SALAS } from './api';

const URL = `${URL_SALAS}/api/v1/salas`;

// nombre en la web → campo en la API
const CAMPOS_EQUIPAMIENTO = {
  proyector: 'tieneProyector',
  computadores: 'tieneComputadores',
  climatizacion: 'tieneClimatizacion',
};

// API → web: agrega la lista "equipamiento" a partir de los tres booleanos.
export const aSalaWeb = (sala) => ({
  ...sala,
  equipamiento: Object.keys(CAMPOS_EQUIPAMIENTO).filter((equipo) => sala[CAMPOS_EQUIPAMIENTO[equipo]]),
});

// web → API: arma el cuerpo que piden POST y PUT /salas.
export const aSalaApi = ({ codigo, nombre, tipo, capacidad, equipamiento, activa = true }) => ({
  codigo,
  nombre,
  tipo,
  capacidad,
  tieneProyector: equipamiento.includes('proyector'),
  tieneComputadores: equipamiento.includes('computadores'),
  tieneClimatizacion: equipamiento.includes('climatizacion'),
  activa,
});

// GET /salas (público): solo activas. Con incluirInactivas (solo coordinador), todas.
export const obtenerSalas = async ({ incluirInactivas = false } = {}) => {
  const salas = await pedir(incluirInactivas ? `${URL}?incluirInactivas=true` : URL);
  return salas.map(aSalaWeb);
};

// POST /salas (coordinador)
export const crearSala = async (datos) =>
  aSalaWeb(await pedir(URL, { metodo: 'POST', cuerpo: aSalaApi(datos) }));

// PUT /salas/{id} (coordinador). También sirve para reactivar (activa: true).
export const editarSala = async (id, datos) =>
  aSalaWeb(await pedir(`${URL}/${id}`, { metodo: 'PUT', cuerpo: aSalaApi(datos) }));

// DELETE /salas/{id} (coordinador): baja lógica, la sala queda con activa: false.
export const desactivarSala = async (id) =>
  aSalaWeb(await pedir(`${URL}/${id}`, { metodo: 'DELETE' }));
