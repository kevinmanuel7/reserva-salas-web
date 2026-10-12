import { horaAMinutos } from './conflictos';

// Busca si alguna reserva ocupa (total o parcialmente) un bloque de una sala.
// Devuelve la reserva encontrada, o undefined si el bloque está libre.
// Importante: "reservas" ya viene filtrada por la fecha seleccionada en la página.
export const reservaEnBloque = (reservas, salaId, bloque) =>
  reservas.find(
    (r) =>
      r.salaId === salaId &&
      horaAMinutos(r.horaInicio) < horaAMinutos(bloque.fin) &&
      horaAMinutos(r.horaFin) > horaAMinutos(bloque.inicio)
  );