import { horaAMinutos } from './conflictos';

// Validaciones genéricas que comparten todas las páginas.
// Las validaciones propias de cada formulario se escriben en su página usando estas funciones.

export const estaVacio = (valor) => valor === undefined || valor === null || String(valor).trim() === '';

export const horarioValido = (horaInicio, horaFin) =>
  !estaVacio(horaInicio) && !estaVacio(horaFin) && horaAMinutos(horaFin) > horaAMinutos(horaInicio);

export const esNumeroPositivo = (valor) => Number.isInteger(Number(valor)) && Number(valor) > 0;
