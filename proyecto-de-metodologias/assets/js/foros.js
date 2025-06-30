document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formForo');
  const tituloInput = document.getElementById('titulo');
  const descripcionInput = document.getElementById('descripcion');
  let msg = document.getElementById('foro-msg');
  if (!msg) {
    msg = document.createElement('div');
    msg.id = 'foro-msg';
    msg.className = 'alert d-none';
    form.parentNode.insertBefore(msg, form.nextSibling);
  }

  if (form && tituloInput && descripcionInput && msg) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.className = "alert d-none";
      msg.textContent = "";

      const titulo = tituloInput.value.trim();
      const descripcion = descripcionInput.value.trim();
      if (!titulo || !descripcion) {
        msg.textContent = "Completa todos los campos.";
        msg.className = "alert alert-danger mt-3";
        return;
      }

      let user = {};
      try {
        user = JSON.parse(localStorage.getItem('userSession') || '{}');
      } catch {
        user = {};
      }
      const creado_por = user.id || null;
      if (!creado_por) {
        msg.textContent = "No se encontró usuario logueado. Vuelve a iniciar sesión.";
        msg.className = "alert alert-danger mt-3";
        return;
      }

      const body = { titulo, descripcion, creado_por };

      try {
        const res = await fetch('https://api-metodologias-production.up.railway.app/api/forums', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        let data = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        if (res.ok) {
          msg.textContent = "¡Foro creado exitosamente!";
          msg.className = "alert alert-success mt-3";
          form.reset();
        } else {
          msg.textContent = (data && data.message) ? data.message : "Error al crear foro.";
          msg.className = "alert alert-danger mt-3";
        }
      } catch {
        msg.textContent = "Error de conexión.";
        msg.className = "alert alert-danger mt-3";
      }
    });
  }
});