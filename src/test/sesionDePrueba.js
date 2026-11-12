// Deja una sesión guardada como la que crea el login real (token + usuario).
// Las pruebas de páginas la usan para simular un usuario logeado.
export const iniciarSesionDePrueba = (nombre = 'Ana Pérez', rol = 'RELATOR') => {
  localStorage.setItem('sesion', JSON.stringify({
    token: 'token-de-prueba',
    usuario: { id: 3, nombre, email: 'prueba@duocuc.test', rol },
  }));
};