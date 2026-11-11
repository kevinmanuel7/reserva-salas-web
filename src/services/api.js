import { leer, guardar, eliminar } from './storage';

// Dirección de cada microservicio. En producción quedan vacías: Nginx atiende todo.
export const URL_USUARIOS = import.meta.env.VITE_API_USUARIOS ?? '';
export const URL_SALAS = import.meta.env.VITE_API_SALAS ?? '';
export const URL_RESERVAS = import.meta.env.VITE_API_RESERVAS ?? '';

// Renovar el token cuando le queden menos de estos minutos.
const MARGEN_REFRESH_MINUTOS = 30;

// Evento que avisa al AuthContext que la sesión venció (para mandar al login).
export const EVENTO_SESION_EXPIRADA = 'sesion-expirada';

const CLAVE_SESION = 'sesion';
export const obtenerSesion = () => leer(CLAVE_SESION, null);
export const guardarSesion = (sesion) => guardar(CLAVE_SESION, sesion);
export const borrarSesion = () => eliminar(CLAVE_SESION);

// Error de la API con los datos del contrato: estado HTTP, código y mensaje.
export class ErrorApi extends Error {
  constructor(estado, codigo, mensaje) {
    super(mensaje);
    this.estado = estado;
    this.codigo = codigo;
  }
}

// Lee "exp" del token (no usa la red) y devuelve los minutos que le quedan.
const minutosRestantes = (token) => {
  const contenido = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const { exp } = JSON.parse(atob(contenido));
  return (exp * 1000 - Date.now()) / 60000;   // exp viene en segundos
};

// Si al token le quedan menos de 30 minutos, pide uno nuevo antes de seguir.
async function renovarSiHaceFalta() {
  const sesion = obtenerSesion();
  if (!sesion || minutosRestantes(sesion.token) > MARGEN_REFRESH_MINUTOS) return;

  try {
    const respuesta = await fetch(`${URL_USUARIOS}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sesion.token}` },
    });
    if (respuesta.ok) guardarSesion(await respuesta.json());
  } catch {
    // Sin conexión con ms-usuarios: se sigue con el token actual.
  }
}
  
// Hace una petición a la API: agrega el token, lo renueva si hace falta
// y convierte los errores del contrato en ErrorApi.
export async function pedir(url, { metodo = 'GET', cuerpo } = {}) {
  // 1. Renovar el token si está por vencer.
  await renovarSiHaceFalta();

  // 2. Armar los headers: JSON si hay cuerpo, y el token si hay sesión.
  const sesion = obtenerSesion();
  const headers = {};
  if (cuerpo !== undefined) headers['Content-Type'] = 'application/json';
  if (sesion) headers.Authorization = `Bearer ${sesion.token}`;

  // 3. Enviar. Si el servidor está apagado, fetch lanza un error de red.
  let respuesta;
  try {
    respuesta = await fetch(url, {
      method: metodo,
      headers,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    throw new ErrorApi(0, 'SIN_CONEXION', 'No se pudo conectar con el servidor');
  }

  // 4. Leer el JSON de la respuesta (puede venir vacía).
  const datos = await respuesta.json().catch(() => null);

  // 5. Errores: un 401 con sesión significa que el token venció o es inválido.
  if (respuesta.status === 401 && sesion) {
    borrarSesion();
    window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
  }
  if (!respuesta.ok) {
    throw new ErrorApi(respuesta.status, datos?.codigo, datos?.mensaje ?? 'Error al comunicarse con el servidor');
  }
  return datos;
}