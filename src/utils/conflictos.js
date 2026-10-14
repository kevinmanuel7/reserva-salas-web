// Convierte "09:30" en minutos desde medianoche (570) para poder comparar horas.
export const horaAMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

// Dos reservas chocan si son de la misma sala, la misma fecha y sus horarios se superponen.
// Bloques contiguos (uno termina 10:30 y el otro empieza 10:30) SÍ se permiten.
export const hayConflicto = (reservas, nueva) =>
  reservas.some(
    (r) =>
      r.id !== nueva.id &&
      r.salaId === nueva.salaId &&
      r.fecha === nueva.fecha &&
      horaAMinutos(nueva.horaInicio) < horaAMinutos(r.horaFin) &&
      horaAMinutos(nueva.horaFin) > horaAMinutos(r.horaInicio)
  );

// Los bloques del borrador no tienen "id" (usan "idTemporal").
// Se les da un id propio para que hayConflicto pueda distinguirlos entre sí.
const borradorComoReservas = (borrador) =>
  borrador.map((b) => ({ ...b, id: `borrador-${b.idTemporal}` }));

// ¿Se puede agregar "nuevo" sin chocar con reservas confirmadas ni con el borrador?
export const bloqueDisponible = (reservas, borrador, nuevo) =>
  !hayConflicto([...reservas, ...borradorComoReservas(borrador)], nuevo);

// Devuelve los idTemporal de los bloques del borrador que chocan
// con una reserva confirmada o con otro bloque del mismo borrador.
export const bloquesConConflicto = (reservas, borrador) => {
  const pendientes = borradorComoReservas(borrador);
  return pendientes
    .filter((b) => hayConflicto([...reservas, ...pendientes], b))
    .map((b) => b.idTemporal);
};
