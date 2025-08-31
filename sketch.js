let interfaz, plano;
let particleSystems = [];
let moleculaSystems = [];
let modo = 'sonido';
let osciladorSonido, osciladorMoleculas;
let contextoAudioActivado = false;
let waveTypes = ['sine', 'triangle', 'square', 'saw'];
let currentWaveIndex = 0;
let drumLoop;
let drumActivo = false;
let mouseTouchActivo = false;
let mouseTouchPos = { x: 0, y: 0 };
let phrase = "VAVATOTOTRATRAVAVEVE";
let phraseIndex = 0;
let letterParticles = [];

let notaX, notaY;

// Botones HTML
let botonGrabar, botonBack, botonAcordes, botonParticulas;

let fondoBlanco = false;

// Paleta de colores
const colors = {
  black: "#000000",
  darkGray: "#1A1A1A",
  magenta: "#FF00E6",
  pink: "#FF2AAF",
  red: "#FF004D",
  green: "#00FF73",
  cyan: "#00FFFF",
  yellow: "#FFFF00",
  white: "#F2F2F2"
};

// ------------------- CLASES -------------------
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.1, 3));
    this.acc = createVector(0, 0);
    this.lifespan = 255;
    this.r = random(1, 2);
  }
  update() {
    this.vel.rotate(.05);
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= .63;
  }
  display() {
    if (fondoBlanco) fill(0, 0, 0, this.lifespan);
    else fill(255, 255, 255, this.lifespan);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.r);
  }
  isDead() { return this.lifespan < 0; }
}

class ParticleSystem {
  constructor() {
    this.origin = createVector(width / 2, height / 2);
    this.particles = [];
  }
  addParticle() { this.particles.push(new Particle(this.origin.x, this.origin.y)); }
  run() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.update(); p.display();
      if (p.isDead()) this.particles.splice(i, 1);
    }
    
    if (fondoBlanco) stroke(0, 88);
    else stroke(255, 88);

    strokeWeight(1);
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        if (dist(this.particles[i].pos.x, this.particles[i].pos.y,
                 this.particles[j].pos.x, this.particles[j].pos.y) < 50) {
          line(this.particles[i].pos.x, this.particles[i].pos.y,
               this.particles[j].pos.x, this.particles[j].pos.y);
        }
      }
    }
  }
}

class Molecula {
  constructor(x, y, letra) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(2, 5));
    this.acc = createVector(0, 0);
    this.lifespan = 255;
    this.letra = letra;
    this.textSize = random(20, 50);
  }
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 2;
    this.vel.mult(0.98);
  }
  display() {
    if (fondoBlanco) fill(0, 0, 0, this.lifespan);
    else fill(255, 255, 255, this.lifespan);
    noStroke();
    textSize(this.textSize);
    textAlign(CENTER, CENTER);
    text(this.letra, this.pos.x, this.pos.y);
  }
  isDead() { return this.lifespan < 0; }
}

class MoleculaSystem {
  constructor() {
    this.origin = createVector(width / 2, height / 2);
    this.moleculas = [];
  }
  addMolecula(letra) { this.moleculas.push(new Molecula(this.origin.x, this.origin.y, letra)); }
  run() {
    for (let i = this.moleculas.length - 1; i >= 0; i--) {
      let m = this.moleculas[i];
      m.update(); m.display();
      if (m.isDead()) this.moleculas.splice(i, 1);
    }
  }
}

// ------------------- P5.JS -------------------
function preload() {
  interfaz = loadImage("fondonegro.png");
  plano = loadImage("assets/4f.png");
  drumLoop = loadSound('assets/audio/KesiKenobyvattdrumsversioncorta.wav');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  notaX = width - 60;
  notaY = 60;

  osciladorSonido = new p5.Oscillator('sine'); osciladorSonido.amp(0); osciladorSonido.start();
  osciladorMoleculas = new p5.Oscillator('triangle'); osciladorMoleculas.amp(0); osciladorMoleculas.start();

  botonGrabar = select('.boton-grabar');
  botonBack = select('.boton-back');
  botonAcordes = select('.boton-acordes');
  botonParticulas = select('.boton-particulas');

  botonGrabar.mousePressed(() => { fondoBlanco = !fondoBlanco; });
  botonBack.mousePressed(() => { modo = 'sonido'; apagarOsciladores(); });
  botonAcordes.mousePressed(() => { modo = 'acordes'; apagarOsciladores(); });
  botonParticulas.mousePressed(() => { modo = 'particulas'; apagarOsciladores(); });

  select('#toggle-drum-btn').mousePressed(() => {
    if (!drumLoop.isPlaying()) {
      drumLoop.loop();
      drumActivo = true;
    } else {
      drumLoop.stop();
      drumActivo = false;
    }
  });

  setInterval(() => {
    const btn = select('#toggle-drum-btn');
    if (drumActivo) {
      btn.style('border-color', '#ff00aa');
      btn.style('color', '#ff00aa');
      btn.style('filter', 'drop-shadow(0 0 10px #00ffff)');
    } else {
      btn.style('border-color', '#00ffff');
      btn.style('color', '#00ffff');
      btn.style('filter', 'none');
    }
  }, 300);
}

function draw() {
  background(fondoBlanco ? colors.white : colors.black);

  if (!fondoBlanco) {
    image(interfaz, 0, 0, width, height);
    image(plano, 0, 0, width, height);
  }

  dibujarGuias();

  // Dibuja cuadrícula horizontal
  push();
  stroke(fondoBlanco ? color(0,80) : color(255,80));
  strokeWeight(1);
  const limiteSuperior = height * 0.2;
  const limiteInferior = height;
  const alturaCuadricula = limiteInferior - limiteSuperior;
  for (let i = 1; i < 5; i++) {
    let y = limiteSuperior + (alturaCuadricula / 5) * i;
    line(0, y, width, y);
  }
  pop();

  // Detecta toques o mouse
  let points = touches.length > 0 ? touches : (mouseTouchActivo ? [mouseTouchPos] : []);
  let limite = height * 0.8;
  points = points.filter(p => p.y < limite);

  if (modo === 'sonido') manejarParticulas(points, osciladorSonido);
  else if (modo === 'particulas') manejarParticulas(points, null);
  else if (modo === 'acordes') manejarMoleculas(points, osciladorMoleculas);

  // Letras conectadas
  for (let i = letterParticles.length - 1; i >= 0; i--) {
    let m = letterParticles[i];
    m.update();
    m.display();
    if (m.isDead()) { letterParticles.splice(i,1); continue; }

    for (let j = i - 1; j >= 0; j--) {
      let other = letterParticles[j];
      if (dist(m.pos.x, m.pos.y, other.pos.x, other.pos.y) < 60) {
        stroke(fondoBlanco ? color(0,50) : color(255,50));
        strokeWeight(1);
        line(m.pos.x, m.pos.y, other.pos.x, other.pos.y);
      }
    }
  }

  // Nota visual
  push();
  noStroke();
  fill(fondoBlanco ? color(0,0,0,50) : color(255,255,255,50));
  textSize(50); textAlign(CENTER, CENTER);
  text('♫', notaX, notaY);
  pop();
}

function mousePressed() { 
  if (touches.length === 0) {
    mouseTouchActivo = !mouseTouchActivo;
    mouseTouchPos.x = mouseX;
    mouseTouchPos.y = mouseY;
  }
}

// ------------------- FUNCIONES AUX -------------------
function manejarParticulas(points, oscilador) {
  while (particleSystems.length < points.length) particleSystems.push(new ParticleSystem());
  while (particleSystems.length > points.length) particleSystems.pop();

  for (let i = 0; i < points.length; i++) {
    let t = points[i];
    let ps = particleSystems[i];
    ps.origin.set(t.x, t.y);
    ps.addParticle(); 
    ps.run();

    if (frameCount % 5 === 0) {
      let nextLetter = phrase.charAt(phraseIndex);
      letterParticles.push(new Molecula(t.x, t.y, nextLetter));
      phraseIndex = (phraseIndex + 1) % phrase.length;
    }

    if (oscilador) {
      let resultado = getEscalaPorSlice(t);
      if (resultado) {
        if (!contextoAudioActivado) { oscilador.start(); oscilador.amp(0.5); contextoAudioActivado = true; }
        oscilador.freq(resultado.frecuencia, 0.4);
      }
    }
  }

  if (oscilador) {
    let vol = waveTypes[currentWaveIndex] === 'saw' ? 0.3 : 0.5;
    let attackTime = waveTypes[currentWaveIndex] === 'saw' ? 1.0 : 0.05;
    oscilador.amp(points.length === 0 ? 0 : vol, attackTime);
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
        if (!contextoAudioActivado) { oscilador.start(); oscilador.amp(0.5); contextoAudioActivado = true; }
        oscilador.freq(resultado.frecuencia, 0.4);
      }
    }
  }

  if (oscilador) oscilador.amp(points.length === 0 ? 0 : 0.5, 0.05);
}

function apagarOsciladores() {
  osciladorSonido.amp(0, 0.05);
  osciladorMoleculas.amp(0, 0.05);
  contextoAudioActivado = false;
  letterParticles = [];
}

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

  let escalaSeleccionada = ['Em','Am','Dm','Bm'][columna] || 'Em';
  let notas = escalasVertical[escalaSeleccionada];
  let indice = floor(map(puntoToque.y, limiteSuperior, limiteInferior, 0, notas.length));
  indice = constrain(indice, 0, notas.length - 1);

  return { escala: escalaSeleccionada, frecuencia: notas[indice] };
}

function dibujarGuias() {
  push();
  strokeWeight(1.5);
  drawingContext.setLineDash([10, 10]);
  stroke(255, 0, 230, 40);
  let anchoColumna = width / 4;
  for (let i = 1; i < 4; i++) {
    line(i * anchoColumna, 0, i * anchoColumna, height);
  }
  drawingContext.setLineDash([]);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
