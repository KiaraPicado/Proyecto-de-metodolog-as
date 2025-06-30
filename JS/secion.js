document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const correo = document.getElementById("correo").value;
  const clave = document.getElementById("clave").value;

  try {
    const response = await fetch("https://api-metodologias-production.up.railway.app/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ correo, clave })
    });

    const data = await response.json();
    console.log(data)
    if (response.ok) {
      window.location.href = "inicio.html";
    } else {
      alert(data.message || "¡Credenciales incorrectas o su usuario no esta registrado!");
    }
  } catch (error) {
    alert("Error de conexión con el servidor");
    console.error(error);
  }
});