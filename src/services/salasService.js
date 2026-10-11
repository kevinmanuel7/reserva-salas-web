import { leer, guardar } from './storage';
import salasIniciales from '../data/salas.json';

const CLAVE = 'salas';

// La primera vez carga el catálogo desde salas.json
export const obtenerSalas = () => {
  const salas = leer(CLAVE, null);
  if (salas) return salas;
  guardar(CLAVE, salasIniciales);
  return salasIniciales;
};

export const obtenerSalaPorId = (id) => obtenerSalas().find((s) => s.id === Number(id));

export const crearSala = (datos) => {
  const salas = obtenerSalas();
  const sala = { ...datos, id: Date.now() };
  guardar(CLAVE, [...salas, sala]);
  return sala;
};

export const editarSala = (id, cambios) => {
  const salas = obtenerSalas().map((s) => (s.id === id ? { ...s, ...cambios, id } : s));
  guardar(CLAVE, salas);
};

export const eliminarSala = (id) => {
  guardar(CLAVE, obtenerSalas().filter((s) => s.id !== id));
};
