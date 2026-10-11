import { leer, guardar } from './storage';
import { hayConflicto } from '../utils/conflictos';

const CLAVE = 'reservas';

export const obtenerReservas = () => leer(CLAVE);

export const obtenerReservasPorRelator = (relator) =>
  obtenerReservas().filter((r) => r.relator === relator);

export const obtenerReservasPorFecha = (fecha) =>
  obtenerReservas().filter((r) => r.fecha === fecha);

export const confirmarReserva = (nueva) => {
  const reservas = obtenerReservas();
  if (hayConflicto(reservas, nueva)) {
    throw new Error('La sala ya está ocupada en ese horario');
  }
  const reserva = { ...nueva, id: Date.now() + Math.floor(Math.random() * 1000) };
  guardar(CLAVE, [...reservas, reserva]);
  return reserva;
};

export const cancelarReserva = (id) => {
  guardar(CLAVE, obtenerReservas().filter((r) => r.id !== id));
};
