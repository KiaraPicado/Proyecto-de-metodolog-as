document.getElementById("formLogin").addEventListener("submit", async function(e) {
  e.preventDefault();

  const correo = document.getElementById("correo").value;
  const clave = document.getElementById("clave").value;
  const loginMsg = document.getElementById("login-msg");

  // Clear previous messages
  loginMsg.innerHTML = "";

  try {
    const response = await fetch("https://api-metodologias-production.up.railway.app/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ correo, clave })
    });

    const data = await response.json();
    console.log(data);
    
    if (response.ok) {
      // Store user session data
      localStorage.setItem('userSession', JSON.stringify(data.usuario || { correo }));
      
      // Show success message briefly before redirect
      loginMsg.innerHTML = '<div class="alert alert-success">¡Inicio de sesión exitoso! Redirigiendo...</div>';
      
      // Redirect to main dashboard
      setTimeout(() => {
        window.location.href = "pages/inicio.html";
      }, 1000);
    } else {
      loginMsg.innerHTML = `<div class="alert alert-danger">${data.message || "¡Credenciales incorrectas o su usuario no está registrado!"}</div>`;
    }
  } catch (error) {
    loginMsg.innerHTML = '<div class="alert alert-danger">Error de conexión con el servidor</div>';
    console.error(error);
  }
});