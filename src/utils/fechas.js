export const hoyISO = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // los meses parten en 0
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};
// Convierte "2026-10-14" en "14-10-2026" para mostrarla al usuario.
export const formatearFecha = (fechaISO) => {
  const [anio, mes, dia] = fechaISO.split('-');
  return `${dia}-${mes}-${anio}`;
};