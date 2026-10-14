import { horaAMinutos } from './conflictos';

export const reservaEnBloque = (reservas, salaId, bloque) =>
  reservas.find(
    (r) =>
      r.salaId === salaId &&
      horaAMinutos(r.horaInicio) < horaAMinutos(bloque.fin) &&
      horaAMinutos(r.horaFin) > horaAMinutos(bloque.inicio)
  );