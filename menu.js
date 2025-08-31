// ------------------- MENU EDITABLE -------------------
window.addEventListener('DOMContentLoaded', () => {
  const menuContainer = document.createElement('div');
  menuContainer.id = 'menu-editable';
  menuContainer.innerHTML = `
    <div class="menu-box">
      <h3>Configuración</h3>

      <label>Idioma:</label>
      <select id="idioma-selector">
        <option value="ES">Español</option>
        <option value="EN">English</option>
      </select>

      <label>Tempo (BPM):</label>
      <input type="range" id="tempo-slider" min="60" max="180" value="120">
      <span id="tempo-value">120</span>

      <label>Texto a dibujar:</label>
      <input type="text" id="texto-input" placeholder="Escribe aquí...">

      <button id="instrucciones-btn">Instrucciones</button>

      <label>Tema visual:</label>
      <select id="tema-selector">
        <option value="oscuro">Oscuro</option>
        <option value="claro">Claro</option>
      </select>
    </div>
  `;
  document.body.appendChild(menuContainer);
    const acordeSection = document.createElement('div');
  acordeSection.innerHTML = `
    <label>Columna 1:</label>
    <select id="columna1-selector">
      <option value="Em">Em</option>
      <option value="Am">Am</option>
      <option value="Dm">Dm</option>
      <option value="Bm">Bm</option>
    </select>

    <label>Columna 2:</label>
    <select id="columna2-selector">
      <option value="Em">Em</option>
      <option value="Am">Am</option>
      <option value="Dm">Dm</option>
      <option value="Bm">Bm</option>
    </select>

    <label>Columna 3:</label>
    <select id="columna3-selector">
      <option value="Em">Em</option>
      <option value="Am">Am</option>
      <option value="Dm">Dm</option>
      <option value="Bm">Bm</option>
    </select>

    <label>Columna 4:</label>
    <select id="columna4-selector">
      <option value="Em">Em</option>
      <option value="Am">Am</option>
      <option value="Dm">Dm</option>
      <option value="Bm">Bm</option>
    </select>
  `;
  // Actualizar tempo
  const tempoSlider = document.getElementById('tempo-slider');
  const tempoValue = document.getElementById('tempo-value');
  tempoSlider.addEventListener('input', () => {
    tempoValue.textContent = tempoSlider.value;
    // Aquí podrías usar tempoSlider.value para ajustar el tempo en tu app
  });

  // Actualizar texto a dibujar
  const textoInput = document.getElementById('texto-input');
  textoInput.addEventListener('input', () => {
    window.phrase = textoInput.value || "VAVATOTOTRATRAVAVEVE";
    window.phraseIndex = 0;
  });

  // Cambiar tema visual
  const temaSelector = document.getElementById('tema-selector');
  temaSelector.addEventListener('change', () => {
    window.fondoBlanco = temaSelector.value === 'claro';
  });

  // Mostrar instrucciones
  const instruccionesBtn = document.getElementById('instrucciones-btn');
  instruccionesBtn.addEventListener('click', () => {
    alert("Toca la pantalla para generar visuales. Usa los botones para cambiar modos. Puedes grabar y exportar tu sesión.");
    
  

  document.querySelector('.menu-box').appendChild(acordeSection);

  // Variables globales para acordes seleccionados
  window.acordesPorColumna = ['Em', 'Am', 'Dm', 'Bm'];

  // Listeners para actualizar acordes
  document.getElementById('columna1-selector').addEventListener('change', e => {
    window.acordesPorColumna[0] = e.target.value;
  });
  document.getElementById('columna2-selector').addEventListener('change', e => {
    window.acordesPorColumna[1] = e.target.value;
  });
  document.getElementById('columna3-selector').addEventListener('change', e => {
    window.acordesPorColumna[2] = e.target.value;
  });
  document.getElementById('columna4-selector').addEventListener('change', e => {
    window.acordesPorColumna[3] = e.target.value;
  });

  });
});
