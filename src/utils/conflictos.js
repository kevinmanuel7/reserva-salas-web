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
