let drumLoop;
let drumPlaying = false;
let drumBtn;
let interfaz, plano;

// Sistemas visuales
let particleSystems = [];
let moleculaSystems = [];
let letterParticles = [];

// Texto dinámico
let phrase = "VAVATOTOTRATRAVAVEVE";
let phraseIndex = 0;

// Osciladores / Audio
let modo = 'sonido';
let osciladorSonido, osciladorMoleculas;
let contextoAudioActivado = false;

// Interacción mouse/touch
let mouseTouchActivo = false;
let mouseTouchPos = { x: 0, y: 0 };

// Notas y posiciones
let notaX, notaY;

// Parámetros editables
let fondoBlanco = false;

// ------------------- CLASES -------------------
// ... Aquí van tus clases Particle, ParticleSystem, Molecula, MoleculaSystem (sin cambios) ...

// ------------------- P5.JS -------------------
function preload() {
  interfaz = loadImage("fondonegro.png");
  plano = loadImage("assets/4f.png");
  soundFormats('mp3', 'wav');
  drumLoop = loadSound('assets/audio/KesiKenobyvattdrumsversioncorta.wav');
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '0');

  // BOTONES HTML
  drumBtn = select('#toggle-drum-btn');
  drumBtn.mousePressed(toggleDrumLoop);

  // Otros botones
  botonGrabar = select('.boton-grabar');
  botonBack = select('.boton-back');
  botonAcordes = select('.boton-acordes');
  botonParticulas = select('.boton-particulas');

  botonGrabar.mousePressed(() => {
    activarContextoAudio();
    fondoBlanco = !fondoBlanco;
  });

  botonBack.mousePressed(() => {
    modo = 'sonido';
    apagarOsciladores();
  });

  botonAcordes.mousePressed(() => {
    activarContextoAudio();
    modo = 'acordes';
    apagarOsciladores();
  });

  botonParticulas.mousePressed(() => {
    activarContextoAudio();
    modo = 'particulas';
    apagarOsciladores();
  });

  notaX = width - 60;
  notaY = 60;

  noCanvasScroll();

  // OSCILADORES
  osciladorSonido = new p5.Oscillator('sine');
  osciladorSonido.amp(0);
  osciladorSonido.start();

  osciladorMoleculas = new p5.Oscillator('triangle');
  osciladorMoleculas.amp(0);
  osciladorMoleculas.start();
}

function draw() {
  background(fondoBlanco ? 255 : 0);

  dibujarTablero();

  if (!fondoBlanco) image(interfaz, 0, 0, width, height);

  push();
  tint(255, 0, 255, fondoBlanco ? 255 : 80);
  image(plano, 0, 0, width, height);
  pop();

  dibujarGuias();

  // Cuadrícula horizontal
  push();
  stroke(fondoBlanco ? 0 : 255, 80);
  strokeWeight(1);
  const limiteSuperior = height * 0.2;
  const limiteInferior = height;
  const alturaCuadricula = limiteInferior - limiteSuperior;
  for (let i = 1; i < 5; i++) {
    let y = limiteSuperior + (alturaCuadricula / 5) * i;
    line(0, y, width, y);
  }
  pop();

  // Puntos de toque
  let points = touches.length > 0 ? touches : (mouseTouchActivo ? [mouseTouchPos] : []);
  points = points.filter(p => p.y < height * 0.8);

  if (modo === 'sonido') manejarParticulas(points, osciladorSonido);
  else if (modo === 'particulas') manejarParticulas(points, null);
  else if (modo === 'acordes') manejarMoleculas(points, osciladorMoleculas);

  // Dibujar letra y líneas
  for (let i = letterParticles.length - 1; i >= 0; i--) {
    let m = letterParticles[i];
    m.update();
    m.display();
    if (m.isDead()) {
      letterParticles.splice(i, 1);
      continue;
    }

    for (let j = i - 1; j >= 0; j--) {
      let other = letterParticles[j];
      if (dist(m.pos.x, m.pos.y, other.pos.x, other.pos.y) < 60) {
        stroke(fondoBlanco ? 0 : 255, 50);
        strokeWeight(1);
        line(m.pos.x, m.pos.y, other.pos.x, other.pos.y);
      }
    }
  }

  // Nota musical
  push();
  noStroke();
  fill(fondoBlanco ? 0, 50 : 255, 50);
  textSize(50);
  textAlign(CENTER, CENTER);
  text('♫', notaX, notaY);
  pop();
}

function mousePressed() {
  if (touches.length === 0) mouseTouchActivo = !mouseTouchActivo;
}

// ------------------- FUNCIONES -------------------
function toggleDrumLoop() {
  if (drumPlaying) {
    drumLoop.stop();
    drumPlaying = false;
  } else {
    drumLoop.loop();
    drumPlaying = true;
  }
}

function activarContextoAudio() {
  if (!contextoAudioActivado) {
    getAudioContext().resume();
    contextoAudioActivado = true;
  }
}

// Aquí van tus funciones manejarParticulas, manejarMoleculas, apagarOsciladores, getEscalaPorSlice, dibujarTablero, dibujarGuias, windowResized


// ------------------- FUNCIONES AUX -------------------
function activarOscilador(oscilador, frecuencia, volumen = 0.5) {
  oscilador.freq(frecuencia, 0.01);   // cambio casi inmediato
  oscilador.amp(volumen, 0.05);       // ataque corto
}

function manejarParticulas(points, oscilador) {
  while (particleSystems.length < points.length) particleSystems.push(new ParticleSystem());
  while (particleSystems.length > points.length) particleSystems.pop();

  for (let i = 0; i < points.length; i++) {
    let t = points[i];
    let ps = particleSystems[i];
    ps.origin.set(t.x, t.y);
    ps.addParticle(); 
    ps.run();

    if (modo === 'particulas' && frameCount % 5 === 0) {
      let nextLetter = phrase.charAt(phraseIndex);
      letterParticles.push(new Molecula(t.x, t.y, nextLetter));
      phraseIndex = (phraseIndex + 1) % phrase.length;
    }

    if (oscilador) {
      let resultado = getEscalaPorSlice(t);
      if (resultado) {
        activarOscilador(oscilador, resultado.frecuencia);
      }
    }
  }

  if (oscilador && points.length === 0) {
    oscilador.amp(0, 0.05); // apagar suave
  }
}

function manejarMoleculas(points, oscilador) {
  while (moleculaSystems.length < points.length) moleculaSystems.push(new MoleculaSystem());
  while (moleculaSystems.length > points.length) moleculaSystems.pop();

  for (let i = 0; i < points.length; i++) {
    let t = points[i];
    let ms = moleculaSystems[i];
    ms.origin.set(t.x, t.y);

    let nextLetter = phrase.charAt(phraseIndex);
    ms.addMolecula(nextLetter);
    phraseIndex = (phraseIndex + 1) % phrase.length;
    ms.run();

    if (oscilador) {
      let resultado = getEscalaPorSlice(t);
      if (resultado) {
        activarOscilador(oscilador, resultado.frecuencia);
      }
    }
  }

  if (oscilador && points.length === 0) {
    oscilador.amp(0, 0.05);
  }
}


function apagarOsciladores() {
  osciladorSonido.amp(0, 0.05);
  osciladorMoleculas.amp(0, 0.05);
  contextoAudioActivado = false;
  letterParticles = [];
}

// ------------------- COLUMNAS / ESCALAS -------------------
function getEscalaPorSlice(puntoToque) {
  const limiteSuperior = height * 0.2;
  const limiteInferior = height;

  let anchoColumna = width / 4;
  let columna = floor(puntoToque.x / anchoColumna);

  const escalasVertical = {
    'Em': [329.63, 392.00, 440.00, 493.88, 587.33],
    'Am': [440.00, 523.25, 587.33, 659.26, 783.99],
    'Dm': [293.66, 349.23, 392.00, 440.00, 523.25],
    'Bm': [493.88, 587.33, 659.26, 739.99, 880.00]
  };

  let escalaSeleccionada;
  if (columna === 0) escalaSeleccionada = 'Em';
  else if (columna === 1) escalaSeleccionada = 'Am';
  else if (columna === 2) escalaSeleccionada = 'Dm';
  else if (columna === 3) escalaSeleccionada = 'Bm';
  else return null;

  let notas = escalasVertical[escalaSeleccionada];
  let indice = floor(map(puntoToque.y, limiteSuperior, limiteInferior, 0, notas.length));
  indice = constrain(indice, 0, notas.length - 1);

  return { escala: escalaSeleccionada, frecuencia: notas[indice] };
}
function dibujarTablero() {
  push();
  noStroke();

  // Fondo negro mate del área táctil
  fill(20, 20, 20, 200); // semi-transparente
  rect(0, height * 0.2, width, height * 0.8);

  // Columnas separadas
  let anchoColumna = width / 4;
  for (let i = 0; i < 4; i++) {
    let x = i * anchoColumna;

    // Si hay toque en esta columna, iluminar
    let activo = false;
    for (let p of touches) {
      if (p.x > x && p.x < x + anchoColumna) activo = true;
    }
    if (mouseTouchActivo &&
        mouseTouchPos.x > x && mouseTouchPos.x < x + anchoColumna) {
      activo = true;
    }

    if (activo) {
      fill(255, 0, 200, 40); // iluminación sutil
      rect(x, height * 0.2, anchoColumna, height * 0.8);
    }

    // Líneas divisorias
    stroke(255, 40);
    strokeWeight(1);
    line(x, height * 0.2, x, height);
  }
  pop();
}

function dibujarGuias() {
  push();
  strokeWeight(1.5);
  drawingContext.setLineDash([10, 10]);
  stroke(255, 0, 230, 40);
  let anchoColumna = width / 4;
  for (let i = 1; i < 4; i++) {
    let x = i * anchoColumna;
    line(x, 0, x, height);
  }
  drawingContext.setLineDash([]);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
