
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login.html';
    }
  
    const nombre = localStorage.getItem('nombre') || 'usuario';
    const nombreUsuario = document.getElementById('nombreUsuario');
    if (nombreUsuario) {
      nombreUsuario.innerText = nombre;
    }
  
    // Configurar el modal de cierre de sesión
    const logoutModal = document.getElementById('logoutModal');
    const btnLogout = document.getElementById('btnLogout');
  
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        if (logoutModal) {
          logoutModal.style.display = 'flex';
        } else {
          cerrarSesion();
        }
      });
    }
  
    if (logoutModal) {
      document.getElementById('confirmLogout').addEventListener('click', cerrarSesion);
      document.getElementById('cancelLogout').addEventListener('click', () => {
        logoutModal.style.display = 'none';
      });
    }
  });
  
  // Función cerrar sesión
  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    window.location.href = '/login.html';
  }
  