import { horaAMinutos } from './conflictos';

// Validaciones genéricas que comparten todas las páginas.

export const estaVacio = (valor) => valor === undefined || valor === null || String(valor).trim() === '';

export const horarioValido = (horaInicio, horaFin) =>
  !estaVacio(horaInicio) && !estaVacio(horaFin) && horaAMinutos(horaFin) > horaAMinutos(horaInicio);

export const esNumeroPositivo = (valor) => Number.isInteger(Number(valor)) && Number(valor) > 0;

// Valida el formulario para agregar un bloque a la reserva.
// Devuelve un objeto con un mensaje por cada campo con error ({} si todo está bien).
// "hoy" llega como parámetro (AAAA-MM-DD) para poder probar la función con cualquier fecha.
export const validarBloque = ({ fecha, bloque, actividad }, hoy) => {
  const errores = {};
  if (estaVacio(fecha)) errores.fecha = 'Selecciona una fecha.';
  else if (fecha < hoy) errores.fecha = 'No se puede reservar en una fecha pasada.';
  if (!bloque) errores.bloque = 'Selecciona un bloque horario.';
  if (estaVacio(actividad)) errores.actividad = 'Indica la actividad o curso.';
  return errores;
};
