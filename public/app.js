let pagina = 1;
let resultadosGlobal = [];
let filtroCategoria = "todas";

console.log("🔥 app.js PRO cargado");

// =======================
// 🔍 BUSCAR JUEGOS (BACKEND)
// =======================
async function buscarJuego(nombre = "") {
  try {
    const response = await fetch(`/api/juegos?nombre=${encodeURIComponent(nombre)}&tipo=${filtroCategoria}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// =======================
// 🔍 BUSCAR (INPUT)
// =======================
async function buscar() {
  const nombre = document.getElementById("busqueda").value;
  const lista = document.getElementById("resultados");

  lista.innerHTML = "🔄 Buscando...";
  pagina = 1;

  resultadosGlobal = await buscarJuego(nombre);

  if (resultadosGlobal.length === 0) {
    lista.innerHTML = `
      <div style="grid-column:1/-1; text-align:center;">
        😢 No se encontraron juegos
      </div>
    `;
    return;
  }

  renderizarResultados();
}

// =======================
// 🎯 FILTROS
// =======================
function toggleFiltroMenu() {
  document.getElementById("menuFiltros").classList.toggle("hidden");
}

async function aplicarFiltro(tipo) {
  filtroCategoria = tipo;
  pagina = 1;

  localStorage.setItem("filtro", tipo);

  resultadosGlobal = await buscarJuego(
    document.getElementById("busqueda").value || ""
  );

  renderizarResultados();
  document.getElementById("menuFiltros").classList.add("hidden");
}
window.addEventListener("click", (e) => {
  const menu = document.getElementById("menuFiltros");
  const contenedor = document.querySelector(".filtro-container");

  if (!contenedor.contains(e.target)) {
    menu.classList.add("hidden");
  }
});

// =======================
// ⭐ RENDER RESULTADOS
// =======================
async function renderizarResultados() {
  const lista = document.getElementById("resultados");
  lista.innerHTML = "";

  const favoritos = await obtenerFavoritos();

  const fin = pagina * 10;
  const juegos = resultadosGlobal.slice(0, fin);

  juegos.forEach(juego => {

    const yaEsFavorito = favoritos.some(f => f.juegoId === juego._id);

    const card = document.createElement("div");
    card.classList.add("card");
    card.onclick = () => verDetalle(juego._id);

    // 🖼️ Imagen
    const img = document.createElement("img");
    img.src = `https://source.unsplash.com/300x400/?boardgame,${juego.nombre}`;

    // 🧠 Título
    const titulo = document.createElement("h3");
    titulo.textContent = juego.nombre;

    // ⭐ Rating
    const rating = juego.rating || 0;

    const estrellas = document.createElement("p");
    estrellas.classList.add("rating");
    estrellas.textContent = `${generarEstrellas(rating)} (${rating.toFixed(1)})`;

    // 📊 Info (AQUÍ ESTÁ EL RANKING)
    const info = document.createElement("p");
    info.classList.add("info");

    const rankTexto = (juego.rank && juego.rank > 0)
      ? `🏆 #${juego.rank}`
      : "🏆 Sin ranking";

    info.innerHTML = `
      ⭐ ${rating.toFixed(1)} | 
      👥 ${juego.usersrated || 0} | 
      ${rankTexto}
    `;

    // 🏆 Badge flotante
    if (juego.rank && juego.rank > 0) {
      const badge = document.createElement("div");

      badge.innerHTML = `🏆 #${juego.rank}`;
      badge.style.position = "absolute";
      badge.style.top = "10px";
      badge.style.left = "10px";
      badge.style.background = "linear-gradient(135deg,#facc15,#f59e0b)";
      badge.style.color = "#000";
      badge.style.padding = "5px 10px";
      badge.style.borderRadius = "10px";
      badge.style.fontWeight = "bold";

      card.appendChild(badge);
    }
    // ===================
    // ❤️ Botón favorito
    // ===================
    const btn = document.createElement("button");

    if (yaEsFavorito) {
      btn.textContent = "✅ Añadido";
      btn.disabled = true;
      btn.classList.add("btn-added");
    } else {
      btn.textContent = "❤️ Guardar";

      btn.onclick = async (e) => {
        e.stopPropagation();

        await guardarFavorito(juego._id, juego.nombre);

        btn.textContent = "✅ Añadido";
        btn.disabled = true;
        btn.classList.add("btn-added");
      };
    }
    card.appendChild(img);
    card.appendChild(titulo);
    card.appendChild(estrellas);
    card.appendChild(info);
    card.appendChild(btn);

    lista.appendChild(card);
  });
  // ==================
  // 🔥 BOTÓN VER MÁS
  // ==================
  const contenedorBtn = document.getElementById("verMasContainer");
  contenedorBtn.innerHTML = "";

  if (resultadosGlobal.length > fin) {
    const btnMas = document.createElement("button");
    btnMas.textContent = "Ver más";

    btnMas.onclick = () => {
    pagina++;
    renderizarResultados();
    };

    contenedorBtn.appendChild(btnMas);
  }
}

// =======================
// ❤️ VER FAVORITOS
// =======================
async function verFavoritos() {
  const lista = document.getElementById("resultados");

  lista.innerHTML = "🔄 Cargando favoritos...";

  const favoritos = await obtenerFavoritos();

  if (favoritos.length === 0) {
    lista.innerHTML = "😢 No tienes favoritos aún";
    return;
  }

  resultadosGlobal = favoritos;
  pagina = 1;

  renderizarResultados();
}

// =======================
// ⭐ ESTRELLAS
// =======================
function generarEstrellas(rating) {
  const r = Math.round(rating);
  let s = "";

  for (let i = 1; i <= 5; i++) {
    s += i <= r ? "⭐" : "☆";
  }

  return s;
}

// ==========================
// 🤖 SUGERENCIAS (TIPO BGG)
// ==========================
let timeout = null;

document.getElementById("busqueda").addEventListener("input", (e) => {
  const valor = e.target.value;

  if (valor.length < 2) return;

  clearTimeout(timeout);

  timeout = setTimeout(async () => {
    const juegos = await buscarJuego(valor);
    mostrarSugerencias(juegos.slice(0, 5));
  }, 300);
});

function mostrarSugerencias(juegos) {
  let cont = document.getElementById("sugerencias");

  if (!cont) {
    cont = document.createElement("div");
    cont.id = "sugerencias";

    cont.style.position = "absolute";
    cont.style.top = "110px";
    cont.style.left = "50%";
    cont.style.transform = "translateX(-50%)";
    cont.style.width = "300px";
    cont.style.background = "#1e293b";
    cont.style.borderRadius = "10px";
    cont.style.zIndex = "9999";

    document.body.appendChild(cont);
  }

  cont.innerHTML = "";

  juegos.forEach(j => {
    const item = document.createElement("div");

    item.innerHTML = `
      <strong>${j.nombre}</strong><br>
      <small>⭐ ${j.rating || 0} | 👥 ${j.usersrated || 0}</small>
    `;

    item.style.padding = "10px";
    item.style.cursor = "pointer";

    item.onclick = () => {
      document.getElementById("busqueda").value = j.nombre;
      buscar();
      cont.innerHTML = "";
    };

    cont.appendChild(item);
  });
}

// ============
// 🚀 INIT
// ============
window.onload = async () => {
  filtroCategoria = localStorage.getItem("filtro") || "todas";

  resultadosGlobal = await buscarJuego("");

  renderizarResultados();

  document.getElementById("busqueda").addEventListener("input", (e) => {
    const valor = e.target.value;

    if (valor.length < 2) return;

    clearTimeout(timeout);

    timeout = setTimeout(async () => {
      const juegos = await buscarJuego(valor);
      mostrarSugerencias(juegos.slice(0, 5));
    }, 300);
  });
};
async function aplicarFiltrosAvanzados() {

  const rating = document.getElementById("filtroRating").value;
  const usuarios = document.getElementById("filtroUsuarios").value;
  const ranking = document.getElementById("filtroRanking").value;
  const anio = document.getElementById("filtroAnio").value;

  const nombre = document.getElementById("busqueda").value;

  const response = await fetch(
    `/api/juegos?nombre=${nombre}&tipo=${filtroCategoria}&rating=${rating}&usuarios=${usuarios}&ranking=${ranking}&anio=${anio}`
  );

  resultadosGlobal = await response.json();

  pagina = 1;
  renderizarResultados();

  toggleFiltroMenu();
}
// ===========================
// 🎮 VER DETALLE (MODAL PRO)
// ===========================
async function verDetalle(id) {
  const modal = document.getElementById("modal");
  const contenido = document.getElementById("modal-content");

  modal.style.display = "flex";
  contenido.innerHTML = "🔄 Cargando detalle...";

  try {
    const res = await fetch(`/api/juegos/${id}`);
    const juego = await res.json();

    const rating = juego.bayesaverage || juego.rating || 0;

    contenido.innerHTML = `
      <div class="detalle-pro">

        <!-- HEADER -->
        <div class="header-detalle">
          <img src="https://source.unsplash.com/400x500/?boardgame,${juego.nombre}" class="img-detalle">

          <div>
             <h2>${juego.nombre}</h2>

             <p class="rating">
              ⭐ ${generarEstrellas(rating)} (${rating.toFixed(1)})
            </p>

            <p>📅 <strong>Año:</strong> ${juego.anio || "No disponible"}</p>
            <p>👥 <strong>Usuarios:</strong> ${juego.usersrated || 0}</p>
            <p>🏆 <strong>Ranking global:</strong> 
              ${juego.rank && juego.rank > 0 ? "#" + juego.rank : "Sin ranking"}
            </p>

            ${juego.is_expansion ? `<p class="tag">🧩 Expansión</p>` : ""}
        </div>
      </div>

      <!-- TABS -->
      <div class="tabs">
        <button onclick="cambiarTab('info')">📄 Información</button>
        <button onclick="cambiarTab('stats')">📊 Estadísticas</button>
        <button onclick="cambiarTab('similares')">🎯 Similares</button>
      </div>

      <!-- INFORMACIÓN -->
      <div id="tab-info" class="tab-content">

        <p>🎲 <strong>Categoría:</strong> ${obtenerCategoria(juego)}</p>
        <p>📅 <strong>Año de publicación:</strong> ${juego.anio || "No disponible"}</p>

        <hr style="margin:15px 0; opacity:0.2;">

        <p style="text-align:left; line-height:1.6; font-size:14px;">
          ${
            juego.descripcion 
            ? juego.descripcion 
            : "📄 No hay descripción disponible para este juego"
          }
        </p>

      </div>
      <!-- ESTADÍSTICAS -->
      <div id="tab-stats" class="tab-content hidden">
        <p>⭐ <strong>Promedio:</strong> ${juego.average || 0}</p>
        <p>🔥 <strong>Promedio ajustado (Bayes):</strong> ${juego.bayesaverage || 0}</p>
        <p>👥 <strong>Total de usuarios:</strong> ${juego.usersrated || 0}</p>
      </div>

      <!-- SIMILARES -->
      <div id="tab-similares" class="tab-content hidden">
        <div id="similares">Cargando juegos similares...</div>
      </div>

      <button onclick="cerrarModal()">❌ Cerrar</button>
    </div>
  `;

    cargarSimilares(juego);

  } catch (error) {
    console.error(error);
    contenido.innerHTML = "❌ Error cargando detalle";
  }
}
function cambiarTab(tab) {
  document.querySelectorAll(".tab-content").forEach(el => {
    el.classList.add("hidden");
  });

  document.getElementById(`tab-${tab}`).classList.remove("hidden");
}
function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}
function obtenerCategoria(juego) {
  if (juego.strategygames_rank) return "Estrategia";
  if (juego.familygames_rank) return "Familiar";
  if (juego.partygames_rank) return "Fiesta";
  return "General";
}
async function cargarSimilares(juego) {
  const contenedor = document.getElementById("similares");

  try {
    const res = await fetch(`/api/juegos?nombre=${juego.nombre}`);
    const juegos = await res.json();

    contenedor.innerHTML = "";

    juegos.slice(0, 5).forEach(j => {
      const div = document.createElement("div");
      div.classList.add("card-mini");

      div.innerHTML = `<p>${j.nombre}</p>`;

      div.onclick = () => verDetalle(j._id);

      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error(error);
  }
}