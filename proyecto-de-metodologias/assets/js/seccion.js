document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("correo").value.trim();
  const clave  = document.getElementById("clave").value.trim();
  const loginMsg = document.getElementById("login-msg");
  loginMsg.innerHTML = "";

  if (!correo || !clave) {
    loginMsg.innerHTML = '<div class="alert alert-warning">Debe completar ambos campos.</div>';
    return;
  }

  try {
    const { data, status } = await axios.post(
      "https://api-metodologias-production.up.railway.app/api/login",
      { correo, clave },
      { headers: { "Content-Type": "application/json" } }
    );

    if (status === 200 && data.success && data.data) {
      const { id, correo: correoUsr, nombre, rol_global } = data.data;
      const { token } = data;

      // Guarda la info del usuario y el token
      localStorage.setItem("userSession", JSON.stringify({ id, correo: correoUsr, nombre, rol_global, token }));

      loginMsg.innerHTML =
        '<div class="alert alert-success">¡Inicio de sesión exitoso! Redirigiendo…</div>';

      setTimeout(() => (window.location.href = "pages/inicio.html"), 1000);
    } else {
      loginMsg.innerHTML =
        `<div class="alert alert-danger">${data.message || "Credenciales incorrectas o usuario no registrado."}</div>`;
    }
  } catch (err) {
    console.error(err);
    loginMsg.innerHTML =
      '<div class="alert alert-danger">No fue posible conectarse al servidor. Intente de nuevo.</div>';
  }
});