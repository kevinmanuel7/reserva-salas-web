import { describe, it, expect, vi, beforeEach } from 'vitest';
import { obtenerSalas, crearSala, desactivarSala, aSalaWeb, aSalaApi } from './salasService';

// Respuesta falsa de fetch con el JSON indicado
const responder = (datos, status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(datos), { status }));

const SALA_API = {
  id: 1, codigo: 'LAB-01', nombre: 'Lab 1', tipo: 'LABORATORIO', capacidad: 25,
  tieneProyector: true, tieneComputadores: true, tieneClimatizacion: false, activa: true,
};

describe('salasService (traducción entre la web y ms-salas)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('aSalaWeb convierte los tres booleanos de la API en la lista equipamiento', () => {
    expect(aSalaWeb(SALA_API).equipamiento).toEqual(['proyector', 'computadores']);
  });

  it('aSalaApi convierte la lista equipamiento en los tres booleanos del contrato', () => {
    const cuerpo = aSalaApi({ codigo: 'S-1', nombre: 'S', tipo: 'SALA_CLASES', capacidad: 10, equipamiento: ['climatizacion'] });
    expect(cuerpo).toEqual({
      codigo: 'S-1', nombre: 'S', tipo: 'SALA_CLASES', capacidad: 10,
      tieneProyector: false, tieneComputadores: false, tieneClimatizacion: true, activa: true,
    });
  });

  it('obtenerSalas llama a GET /api/v1/salas y devuelve las salas traducidas', async () => {
    const espia = responder([SALA_API]);

    const salas = await obtenerSalas();

    expect(espia.mock.calls[0][0]).toMatch(/\/api\/v1\/salas$/);
    expect(salas[0].equipamiento).toEqual(['proyector', 'computadores']);
  });

  it('obtenerSalas con incluirInactivas agrega el filtro del coordinador', async () => {
    const espia = responder([]);
    await obtenerSalas({ incluirInactivas: true });
    expect(espia.mock.calls[0][0]).toMatch(/\/api\/v1\/salas\?incluirInactivas=true$/);
  });

  it('crearSala envía POST con el cuerpo del contrato', async () => {
    const espia = responder(SALA_API, 201);

    await crearSala({ codigo: 'LAB-01', nombre: 'Lab 1', tipo: 'LABORATORIO', capacidad: 25, equipamiento: ['proyector'] });

    const [, opciones] = espia.mock.calls[0];
    expect(opciones.method).toBe('POST');
    expect(JSON.parse(opciones.body)).toMatchObject({ codigo: 'LAB-01', tieneProyector: true, tieneComputadores: false });
  });

  it('desactivarSala envía DELETE a /salas/{id} (baja lógica)', async () => {
    const espia = responder({ ...SALA_API, activa: false });

    const sala = await desactivarSala(1);

    expect(espia.mock.calls[0][0]).toMatch(/\/api\/v1\/salas\/1$/);
    expect(espia.mock.calls[0][1].method).toBe('DELETE');
    expect(sala.activa).toBe(false);
  });
});
