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
    if (fondoBlanco) {
      fill(0, 0, 0, this.lifespan);
    } else {
      fill(255, 255, 255, this.lifespan);
    }
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
    
    if (fondoBlanco) {
        stroke(0, 88);
    } else {
        stroke(255, 88);
    }
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
    if (fondoBlanco) {
      fill(0, 0, 0, this.lifespan);
    } else {
      fill(255, 255, 255, this.lifespan);
    }
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
  drumLoop = loadSound('assets/audio/KesiKenobyvattdrumsversioncorta.wav'); // Ruta correcta
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

  select('#drum-btn').mousePressed(() => {
    if (!drumLoop.isPlaying()) {
      drumLoop.loop();
      drumActivo = true;
    } else {
      drumLoop.stop();
      drumActivo = false;
    }
  });

  setInterval(() => {
    const btn = select('#drum-btn');
    if (drumActivo) {
      btn.style('border-color', '#ff00aa');
      btn.style('color', '#ff00aa');
    } else {
      btn.style('border-color', '#00ffff');
      btn.style('color', '#00ffff');
    }
  }, 300);
}

function updateDrumButton() {
  const btn = select('#drum-btn');
  if (drumActivo) {
    btn.style('filter', 'drop-shadow(0 0 10px #00ffff)');
  } else {
    btn.style('filter', 'none');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


