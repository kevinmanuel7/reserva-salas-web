// ÚNICO archivo del proyecto que usa localStorage directamente.
export const leer = (clave, porDefecto = []) => {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? porDefecto;
  } catch {
    return porDefecto;
  }
};

export const guardar = (clave, valor) => localStorage.setItem(clave, JSON.stringify(valor));

export const eliminar = (clave) => localStorage.removeItem(clave);
