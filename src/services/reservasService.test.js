import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aReservaWeb, aReservaApi, obtenerDisponibilidad, confirmarVarias } from './reservasService';

const responder = (datos, status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(datos), { status }));

describe('reservasService (traducción entre la web y ms-reservas)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('aReservaWeb convierte los números de bloque en horas y nombreRelator en relator', () => {
    const reserva = aReservaWeb({ id: 1, salaId: 1, bloqueInicio: 2, bloqueFin: 4, nombreRelator: 'Ana' });
    expect(reserva).toMatchObject({ horaInicio: '09:05', horaFin: '12:00', relator: 'Ana' });
  });

  it('aReservaApi convierte las horas en números de bloque y no envía el relator', () => {
    const cuerpo = aReservaApi({
      salaId: 1, fecha: '2026-11-30', horaInicio: '09:05', horaFin: '10:00', actividad: 'Taller', relator: 'Ana', idTemporal: 7,
    });
    expect(cuerpo).toEqual({ salaId: 1, fecha: '2026-11-30', bloqueInicio: 2, bloqueFin: 2, actividad: 'Taller' });
  });

  it('obtenerDisponibilidad pide la ruta pública y le da un id a cada bloque ocupado', async () => {
    const espia = responder([{ salaId: 3, fecha: '2026-11-30', bloqueInicio: 1, bloqueFin: 1 }]);

    const ocupados = await obtenerDisponibilidad('2026-11-30', 3);

    expect(espia.mock.calls[0][0]).toMatch(/\/api\/v1\/reservas\/disponibilidad\?fecha=2026-11-30&salaId=3$/);
    expect(ocupados[0]).toMatchObject({ id: 'ocupado-0', horaInicio: '08:00', horaFin: '09:00' });
  });

  it('confirmarVarias envía todo el borrador en un solo POST /reservas/lote', async () => {
    const espia = responder([], 201);

    await confirmarVarias([
      { salaId: 1, fecha: '2026-11-30', horaInicio: '08:00', horaFin: '09:00', actividad: 'A' },
      { salaId: 2, fecha: '2026-11-30', horaInicio: '10:05', horaFin: '11:00', actividad: 'B' },
    ]);

    const [url, opciones] = espia.mock.calls[0];
    expect(url).toMatch(/\/api\/v1\/reservas\/lote$/);
    expect(JSON.parse(opciones.body).map((r) => r.bloqueInicio)).toEqual([1, 3]);
  });

  it('si ms-reservas responde 409, el error trae el mensaje del backend', async () => {
    responder({ codigo: 'CRUCE_HORARIO', mensaje: 'Reserva 1 de 1: La sala ya está ocupada' }, 409);

    await expect(confirmarVarias([
      { salaId: 1, fecha: '2026-11-30', horaInicio: '08:00', horaFin: '09:00', actividad: 'A' },
    ])).rejects.toMatchObject({ estado: 409, codigo: 'CRUCE_HORARIO', message: 'Reserva 1 de 1: La sala ya está ocupada' });
  });
});
