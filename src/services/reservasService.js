// Reservas: se leen y crean en ms-reservas (puerto 8083 en local).
// La API identifica el horario con números de bloque (bloqueInicio, bloqueFin: 1 a 13),
// pero las páginas trabajan con horas (horaInicio "09:05", horaFin "10:00").
// Este archivo traduce entre los dos usando la tabla BLOQUES, que es la misma de GET /bloques.
import { pedir, URL_RESERVAS } from './api';
import { BLOQUES } from '../data/bloques';

const URL = `${URL_RESERVAS}/api/v1/reservas`;

// API → web: agrega horaInicio, horaFin y relator.
export const aReservaWeb = (reserva) => ({
  ...reserva,
  relator: reserva.nombreRelator,
  horaInicio: BLOQUES[reserva.bloqueInicio - 1].inicio,
  horaFin: BLOQUES[reserva.bloqueFin - 1].fin,
});

// web → API: convierte las horas en números de bloque (el bloque 1 es el índice 0).
export const aReservaApi = ({ salaId, fecha, horaInicio, horaFin, actividad }) => ({
  salaId,
  fecha,
  bloqueInicio: BLOQUES.findIndex((b) => b.inicio === horaInicio) + 1,
  bloqueFin: BLOQUES.findIndex((b) => b.fin === horaFin) + 1,
  actividad,
});

// GET /reservas?fecha= (con sesión): reservas del día con relator y actividad.
export const obtenerReservasPorFecha = async (fecha) =>
  (await pedir(`${URL}?fecha=${fecha}`)).map(aReservaWeb);

// GET /reservas/disponibilidad?fecha= (público): solo qué bloques están ocupados.
// Se puede filtrar por sala. Esta respuesta no trae "id" (para no exponer datos), así que
// se le da uno propio: la revisión de choques (utils/conflictos) distingue las reservas por id.
export const obtenerDisponibilidad = async (fecha, salaId) => {
  const filtroSala = salaId ? `&salaId=${salaId}` : '';
  const ocupados = await pedir(`${URL}/disponibilidad?fecha=${fecha}${filtroSala}`);
  return ocupados.map((o, i) => aReservaWeb({ ...o, id: `ocupado-${i}` }));
};

// GET /reservas/mias: reservas activas del usuario del token.
export const obtenerMisReservas = async () => (await pedir(`${URL}/mias`)).map(aReservaWeb);

// POST /reservas/lote: confirma varias reservas, TODO O NADA (lo garantiza el backend).
export const confirmarVarias = async (bloques) =>
  (await pedir(`${URL}/lote`, { metodo: 'POST', cuerpo: bloques.map(aReservaApi) })).map(aReservaWeb);

// PUT /reservas/{id}/cancelar: la reserva queda en estado CANCELADA.
export const cancelarReserva = async (id) =>
  aReservaWeb(await pedir(`${URL}/${id}/cancelar`, { metodo: 'PUT' }));
