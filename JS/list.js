 async function cargarForos() {
      try {
        const respuesta = await fetch("https://api-metodologias-production.up.railway.app/api/forums");
        const foros = await respuesta.json();
        console.log("Foros recibidos:", foros.data); 
        
        const container = document.getElementById("foroContainer");
        container.innerHTML = "";
        if(!Array.isArray(foros.data)|| foros.data==0){
          container.innerHTML='<p class="text-muted text-center">No hay foros Disponibles.</p>';
          return;
        }


        foros.data.forEach(foro => {
         
          const fechaCreacion = new Date(foro.creado_en).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          const cardHTML = `
            <div class="col-md-4 mb-4">
              <div class="card h-100 shadow-sm">
                <div class="card-body">
                  <h5 class="card-title">${foro.titulo}</h5>
                  <p class="card-text">${foro.descripcion || "Sin descripción."}</p>
                  <p><strong>Creado por:</strong> ${foro.creador_nombre || "Desconocido"}</p>
                  <p><strong>Fecha creación:</strong> ${fechaCreacion}</p>
                  <p><strong>¿Es público?:</strong> ${foro.es_publico}</p>
                </div>
              </div>
            </div>
          `;

          container.insertAdjacentHTML("beforeend", cardHTML);
        });
      } catch (error) {
        console.error("Error al cargar los foros:", error);
        document.getElementById("foroContainer").innerHTML =
          '<div class="alert alert-danger text-center">Error al cargar los foros.</div>';
      }
    }

    window.addEventListener("DOMContentLoaded", cargarForos);