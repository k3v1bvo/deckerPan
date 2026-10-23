// ==========================================
// DENCKER PAN — ARTISANAL ASMR SOUND SYSTEM
// Web Audio API Synthesizer with Audio Autoplay & Mute Control
// ==========================================

class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private listeners: ((muted: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dencker_sound_muted");
      if (saved !== null) {
        this.isMuted = saved === "true";
      }
    }
  }

  public subscribe(fn: (muted: boolean) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("dencker_sound_muted", String(this.isMuted));
    }
    this.listeners.forEach((fn) => fn(this.isMuted));
    if (!this.isMuted) {
      this.playPorcelainTink();
    }
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("dencker_sound_muted", String(this.isMuted));
    }
    this.listeners.forEach((fn) => fn(this.isMuted));
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Micro-sonido sutil del hojaldre o papel crinkle (Ondas sinusoidales de alta frecuencia + ruido blanco filtrado)
   * Diseñado para el botón "Agregar al Pedido"
   */
  playPastryCrinkle() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Ruido blanco filtrado con envolvente de fractura en hojaldre
      const bufferSize = Math.floor(ctx.sampleRate * 0.14);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        const decay = Math.pow(1 - i / bufferSize, 2.2);
        const microSnap = Math.random() > 0.85 ? 1.8 : 0.45;
        data[i] = white * decay * microSnap;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(3800, now);
      bandpass.frequency.exponentialRampToValueAtTime(1900, now + 0.12);
      bandpass.Q.setValueAtTime(2.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.26, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      noiseSource.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start(now);
      noiseSource.stop(now + 0.14);

      // Micro-ondas sinusoidales de alta frecuencia (snap cristalino del hojaldre crujiente)
      const highFreqs = [3520, 5280];
      highFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.015);

        oscGain.gain.setValueAtTime(0.12, now + idx * 0.015);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.015 + 0.06);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now + idx * 0.015);
        osc.stop(now + idx * 0.015 + 0.07);
      });
    } catch {}
  }

  /**
   * Timbre vintage armónico y resonante de caja registradora clásica
   */
  playVintageRegisterDing() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Golpe mecánico sutil de percutor
      const strike = ctx.createOscillator();
      const strikeGain = ctx.createGain();
      strike.type = "triangle";
      strike.frequency.setValueAtTime(240, now);
      strike.frequency.exponentialRampToValueAtTime(60, now + 0.04);
      strikeGain.gain.setValueAtTime(0.2, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      strike.connect(strikeGain);
      strikeGain.connect(ctx.destination);
      strike.start(now);
      strike.stop(now + 0.05);

      // Armónicos metálicos de campana clásica de latón
      const chimeFreqs = [1760, 3520, 5280];
      chimeFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + 0.02);

        const initialGain = idx === 0 ? 0.45 : idx === 1 ? 0.24 : 0.12;
        gain.gain.setValueAtTime(initialGain, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.02);
        osc.stop(now + 1.15);
      });
    } catch {}
  }

  /**
   * ASMR 1: Crujido de pan recién horneado (Horneados de la Casa)
   * Ráfaga crujiente de micro-impulsos filtrados orgánicamente
   */
  playBreadCrunch() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.18; // 180ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Generar textura granular similar al crujido de la corteza
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Modulación no lineal para simular fracturas de la miga y corteza
        const envelope = Math.pow(1 - i / bufferSize, 1.8);
        const microCrack = Math.random() > 0.88 ? 1.6 : 0.4;
        output[i] = white * envelope * microCrack;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Filtro paso-banda centrado en la resonancia de corteza tostada
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.exponentialRampToValueAtTime(1100, now + 0.16);
      filter.Q.setValueAtTime(2.2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.19);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * ASMR 2: Tintineo cristalino de cuchara en porcelana fina (Repostería & Café)
   */
  playPorcelainTink() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const freqs = [2637.02, 5274.04]; // E7 y su armónico superior

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        const initialGain = idx === 0 ? 0.28 : 0.12;
        gain.gain.setValueAtTime(initialGain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.58);
      });
    } catch {}
  }

  /**
   * ASMR 3: Vapor y extracción de café de especialidad
   */
  playCoffeeSteam() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.linearRampToValueAtTime(400, now + 0.25);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.26);
    } catch {}
  }

  /**
   * Click táctil claro, satisfactorio y con cuerpo para botones y tabs
   */
  playClick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
    } catch {}
  }

  /**
   * Chime cálido de panadería (al entrar comanda o completar acción principal)
   */
  playOrderChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // Acorde C mayor (C5, E5, G5, C6)

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * 0.07);

        gain.gain.setValueAtTime(0, now + index * 0.07);
        gain.gain.linearRampToValueAtTime(0.25, now + index * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.07 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.07);
        osc.stop(now + index * 0.07 + 0.52);
      });
    } catch {}
  }

  /**
   * Campanilla de servicio para el mesero
   */
  playWaiterBell() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12); // Ting!

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);
    } catch {}
  }

  /**
   * Vintage Brass Cash Register "Ka-Ching!" (Campanilla de bronce + resorte cajón + tintineo de monedas)
   */
  playCashRegister() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 1. Golpe de palanca mecánico inicial (0 - 50ms)
      const lever = ctx.createOscillator();
      const leverGain = ctx.createGain();
      lever.type = "sawtooth";
      lever.frequency.setValueAtTime(320, now);
      lever.frequency.exponentialRampToValueAtTime(70, now + 0.05);
      leverGain.gain.setValueAtTime(0.25, now);
      leverGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      lever.connect(leverGain);
      leverGain.connect(ctx.destination);
      lever.start(now);
      lever.stop(now + 0.06);

      // 2. Campanilla metálica icónica "¡DING!" (70ms)
      const bellFreqs = [1760, 3520]; // A6 y armónico
      bellFreqs.forEach((freq, idx) => {
        const bell = ctx.createOscillator();
        const bGain = ctx.createGain();
        bell.type = "sine";
        bell.frequency.setValueAtTime(freq, now + 0.06);
        bGain.gain.setValueAtTime(idx === 0 ? 0.45 : 0.22, now + 0.06);
        bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
        bell.connect(bGain);
        bGain.connect(ctx.destination);
        bell.start(now + 0.06);
        bell.stop(now + 0.78);
      });

      // 3. Deslizamiento metálico del cajón abriéndose (80ms - 260ms)
      const bufSize = Math.floor(ctx.sampleRate * 0.22);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.4);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400, now + 0.08);
      filter.Q.setValueAtTime(2.8, now + 0.08);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.28, now + 0.08);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now + 0.08);
      noise.stop(now + 0.27);

      // 4. Monedas tintineando en la gaveta "Clink-clink-clash" (150ms - 420ms)
      const coinTones = [2960, 3951, 2637, 3322, 4186];
      coinTones.forEach((cf, idx) => {
        const coin = ctx.createOscillator();
        const cGain = ctx.createGain();
        coin.type = "triangle";
        const startT = now + 0.14 + idx * 0.04;
        coin.frequency.setValueAtTime(cf, startT);
        cGain.gain.setValueAtTime(0.18, startT);
        cGain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.16);
        coin.connect(cGain);
        cGain.connect(ctx.destination);
        coin.start(startT);
        coin.stop(startT + 0.17);
      });
    } catch {}
  }

  /**
   * Monedas cayendo en bandeja (para calculadora de cambio)
   */
  playCoinRattle() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const coins = [3135, 4186, 2793];
      coins.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        const t = now + idx * 0.05;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
      });
    } catch {}
  }

  /**
   * Beep de datáfono POS / Contactless RFID
   */
  playPOSBeep() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1760, now); // A6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  /**
   * Click táctil satisfactorio para cualquier botón del sistema
   */
  playTactileClick() {
    this.playClick();
  }

  /**
   * Notificación armónica de éxito (Pago completado o pedido listo)
   */
  playSuccessTone() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [587.33, 880]; // D5, A5

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.24, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.5);
      });
    } catch {}
  }

  /**
   * Tono de advertencia / PIN incorrecto
   */
  playAlertTone() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(160, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }
}

export const soundManager = new SoundManager();

