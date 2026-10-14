import { leer, guardar } from './storage';
import { hayConflicto, bloquesConConflicto } from '../utils/conflictos';

const CLAVE = 'reservas';

export const obtenerReservas = () => leer(CLAVE);

export const obtenerReservasPorRelator = (relator) =>
  obtenerReservas().filter((r) => r.relator === relator);

export const obtenerReservasPorFecha = (fecha) =>
  obtenerReservas().filter((r) => r.fecha === fecha);

// Deja solo los campos de una reserva (sin datos temporales del borrador)
const limpiarReserva = ({ salaId, fecha, horaInicio, horaFin, relator, actividad }) => ({
  salaId, fecha, horaInicio, horaFin, relator, actividad,
});

const nuevoId = () => Date.now() + Math.floor(Math.random() * 100000);

export const confirmarReserva = (nueva) => {
  const reservas = obtenerReservas();
  if (hayConflicto(reservas, nueva)) {
    throw new Error('La sala ya está ocupada en ese horario');
  }
  const reserva = { ...limpiarReserva(nueva), id: nuevoId() };
  guardar(CLAVE, [...reservas, reserva]);
  return reserva;
};

// Confirma varios bloques de una vez: TODO O NADA.
// Primero revisa que ninguno choque (con reservas existentes ni entre ellos)
// y recién ahí guarda todos juntos. Si alguno choca, no se guarda ninguno.
export const confirmarVarias = (bloques) => {
  const reservas = obtenerReservas();
  if (bloquesConConflicto(reservas, bloques).length > 0) {
    throw new Error('Hay bloques que chocan con otras reservas. Revisa los marcados en rojo.');
  }
  const base = nuevoId();
  const nuevas = bloques.map((b, i) => ({ ...limpiarReserva(b), id: base + i }));
  guardar(CLAVE, [...reservas, ...nuevas]);
  return nuevas;
};

export const cancelarReserva = (id) => {
  guardar(CLAVE, obtenerReservas().filter((r) => r.id !== id));
};
