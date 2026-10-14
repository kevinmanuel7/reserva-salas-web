// Bloques horarios de la sede: de 08:00 a 21:00.
// El primero dura 60 minutos y los siguientes 55, con 5 minutos de pausa entre bloques.
export const BLOQUES = [
  { inicio: '08:00', fin: '09:00' },
  { inicio: '09:05', fin: '10:00' },
  { inicio: '10:05', fin: '11:00' },
  { inicio: '11:05', fin: '12:00' },
  { inicio: '12:05', fin: '13:00' },
  { inicio: '13:05', fin: '14:00' },
  { inicio: '14:05', fin: '15:00' },
  { inicio: '15:05', fin: '16:00' },
  { inicio: '16:05', fin: '17:00' },
  { inicio: '17:05', fin: '18:00' },
  { inicio: '18:05', fin: '19:00' },
  { inicio: '19:05', fin: '20:00' },
  { inicio: '20:05', fin: '21:00' },
];

export const EQUIPAMIENTOS = ['proyector', 'computadores', 'climatizacion'];

// Nombre para mostrar de cada equipamiento
export const NOMBRES_EQUIPAMIENTO = {
  proyector: 'Proyector',
  computadores: 'Computadores',
  climatizacion: 'Climatización',
};
