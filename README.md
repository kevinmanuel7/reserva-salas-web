# Reserva de espacios · Frontend web

Frontend en React del sistema de reserva de salas para **THERIONLABS SpA**.
Proyecto de la Evaluación Parcial 2 de **DSY1104 Desarrollo Fullstack II** (Duoc UC), vinculado al caso de **DSY1105 Desarrollo de Aplicaciones Móviles**.

En esta etapa los datos se guardan en `localStorage`. Más adelante, la carpeta `src/services/` se conectará a la API REST en Spring Boot que usa la app Android.

## Tecnologías

- React + Vite
- React Router
- Bootstrap 5
- Vitest + React Testing Library (pruebas unitarias y cobertura)

## Cómo ejecutar

```bash
npm install        # instalar dependencias (solo la primera vez)
npm run dev        # levantar en http://localhost:5173
npm test           # pruebas en modo observación
npm run coverage   # informe de cobertura (abrir coverage/index.html)
npm run build      # versión de producción en dist/
```

## Estructura

```
src/
  data/        salas.json, bloques.js       datos ficticios y constantes
  utils/       conflictos.js, validaciones.js  funciones puras (sin React)
  services/    storage.js                   ÚNICO archivo que toca localStorage
               salasService.js, reservasService.js, borradorService.js
  context/     AuthContext.jsx              usuario y rol logeado
  components/  NavBar, Footer, RutaProtegida y componentes de cada página
  pages/       Login, Salas, MiReserva, Agenda, MisReservas, Admin
```

## Páginas y responsables

| Página | Ruta | Responsable |
|---|---|---|
| Login | `/login` | Persona 1 |
| Salas | `/salas` | Persona 1 |
| Mi reserva (borrador / "carrito") | `/mi-reserva` | Persona 1 |
| Agenda (inicio) | `/` | Persona 2 |
| Mis reservas | `/mis-reservas` | Persona 2 |
| Administración (solo coordinador) | `/admin` | Persona 2 |

## Reglas rápidas

1. Ningún componente usa `localStorage` directamente: todo pasa por `services/`.
2. La lógica (validar, calcular cruces) va en `utils/` como funciones puras.
3. Las páginas manejan el estado y lo pasan a los componentes por props.
4. Solo clases de Bootstrap; los colores de marca están únicamente en `src/index.css`.
5. Las pruebas van junto al archivo que prueban: `SalaCard.jsx` → `SalaCard.test.jsx`.
6. Ramas: `main` (entrega), `develop` (integración), `feature/persona1`, `feature/persona2`.

El detalle completo está en el documento *Plan y reglas del proyecto*.

## Claves de localStorage

| Clave | Contenido |
|---|---|
| `salas` | Catálogo de salas (se inicializa desde `salas.json`) |
| `reservas_borrador` | Bloques agregados aún sin confirmar |
| `reservas` | Reservas confirmadas |
| `usuario` | Usuario y rol logeado |

> Todos los datos son ficticios (Ley N.º 19.628 y Ley N.º 21.719).
