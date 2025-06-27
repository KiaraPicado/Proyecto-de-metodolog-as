document.getElementById('formRegistro').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const correo = document.getElementById('correo').value;
  const clave = document.getElementById('clave').value;
  const rol = document.getElementById('rol').value;
  const msg = document.getElementById('register-msg');
  msg.textContent = "";
  msg.className = "msg";
  const body = { nombre, correo, clave, rol_global: rol };

  try {
    const res = await fetch('https://api-metodologias-production.up.railway.app/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      msg.textContent = "Usuario registrado exitosamente";
      msg.classList.add("success");
      document.getElementById('formRegistro').reset();
    } else {
      const data = await res.json().catch(() => ({}));
      msg.textContent = data?.message || "Error al registrar usuario.";
      msg.classList.add("error");
    }
  } catch {
    msg.textContent = "Error de conexión.";
    msg.classList.add("error");
  }
});
