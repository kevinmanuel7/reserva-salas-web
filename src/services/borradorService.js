import { leer, guardar, eliminar } from './storage';

// El "carrito" de reservas: bloques agregados que aún no se confirman.
const CLAVE = 'reservas_borrador';
export const EVENTO_BORRADOR = 'borrador-actualizado';

// Avisa a la NavBar (badge) cada vez que cambia el borrador
const avisarCambio = () => window.dispatchEvent(new Event(EVENTO_BORRADOR));

export const obtenerBorrador = () => leer(CLAVE);

export const agregarBloque = (bloque) => {
  const item = { ...bloque, idTemporal: Date.now() + Math.floor(Math.random() * 1000) };
  guardar(CLAVE, [...obtenerBorrador(), item]);
  avisarCambio();
  return item;
};

export const actualizarBloque = (idTemporal, cambios) => {
  guardar(CLAVE, obtenerBorrador().map((b) => (b.idTemporal === idTemporal ? { ...b, ...cambios } : b)));
  avisarCambio();
};

export const quitarBloque = (idTemporal) => {
  guardar(CLAVE, obtenerBorrador().filter((b) => b.idTemporal !== idTemporal));
  avisarCambio();
};

export const vaciarBorrador = () => {
  eliminar(CLAVE);
  avisarCambio();
};
