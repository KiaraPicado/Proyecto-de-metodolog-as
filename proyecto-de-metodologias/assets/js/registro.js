document.getElementById('formRegistro').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const correo = document.getElementById('correo').value;
  const clave = document.getElementById('clave').value;
  const rol = document.getElementById('rol').value;
  const msg = document.getElementById('register-msg');
  msg.innerHTML = "";
  const body = { nombre, correo, clave, rol_global: rol };

  try {
    const res = await fetch('https://api-metodologias-production.up.railway.app/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      msg.innerHTML = '<div class="alert alert-success">Usuario registrado exitosamente. Redirigiendo al login...</div>';
      document.getElementById('formRegistro').reset();
      
      // Redirect to login after successful registration
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 2000);
    } else {
      const data = await res.json().catch(() => ({}));
      msg.innerHTML = `<div class="alert alert-danger">${data?.message || "Error al registrar usuario."}</div>`;
    }
  } catch {
    msg.innerHTML = '<div class="alert alert-danger">Error de conexión.</div>';
  }
});