const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function basicWave(phase, shape) {
  if (shape === 'sine') return Math.sin(phase * TAU);
  if (shape === 'triangle') return 1 - 4 * Math.abs(phase - 0.5);
  if (shape === 'square') return phase < 0.5 ? 1 : -1;
  if (shape === 'saw') return phase * 2 - 1;
  if (shape === 'noise') return Math.random() * 2 - 1;
  return Math.sin(phase * TAU);
}

function tableSample(tables, phase, position, fallbackWave) {
  if (!tables || !tables.length || !tables[0]?.length) return basicWave(phase, fallbackWave);
  const framePosition = clamp(position, 0, 1) * Math.max(0, tables.length - 1);
  const firstIndex = Math.floor(framePosition);
  const secondIndex = Math.min(tables.length - 1, firstIndex + 1);
  const blend = framePosition - firstIndex;
  const first = tables[firstIndex];
  const second = tables[secondIndex];
  const size = first.length;
  const samplePosition = phase * size;
  const index = Math.floor(samplePosition) % size;
  const next = (index + 1) % size;
  const fraction = samplePosition - Math.floor(samplePosition);
  const a = first[index] + (first[next] - first[index]) * fraction;
  if (!second || second === first) return a;
  const b = second[index] + (second[next] - second[index]) * fraction;
  return a + (b - a) * blend;
}

class WavetableProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.patch = {
      osc1: { enabled: true, wave: 'saw', tables: null, position: 0, level: 0.72, octave: 0, semitone: 0, unison: 1, detune: 0.12, pan: 0 },
      osc2: { enabled: false, wave: 'triangle', tables: null, position: 0, level: 0.22, octave: 0, semitone: 0, unison: 1, detune: 0.1, pan: 0 },
      filter: { enabled: true, cutoffHz: 6000, resonance: 0.12, drive: 0 },
      env: { attack: 0.012, decay: 0.5, sustain: 0.72, release: 0.4 },
      effects: { reverb: 0.12, delay: 0.05, distortion: 0.02, chorus: 0.08 },
      masterVolume: 0.8,
    };
    this.voices = [];
    this.maxVoices = 24;
    this.delaySize = Math.max(2, Math.floor(sampleRate * 2.2));
    this.delayL = new Float32Array(this.delaySize);
    this.delayR = new Float32Array(this.delaySize);
    this.delayIndex = 0;
    const combLengths = [0.031, 0.037, 0.043, 0.051].map((seconds) => Math.floor(sampleRate * seconds));
    this.combsL = combLengths.map((length) => new Float32Array(length));
    this.combsR = combLengths.map((length) => new Float32Array(length + 113));
    this.combIndicesL = combLengths.map(() => 0);
    this.combIndicesR = combLengths.map(() => 0);
    this.filterStateL = 0;
    this.filterStateR = 0;
    this.lastFilterL = 0;
    this.lastFilterR = 0;
    this.port.onmessage = (event) => this.onMessage(event.data);
  }

  onMessage(message) {
    if (!message) return;
    if (message.type === 'preset') {
      const next = message.patch || {};
      this.patch = {
        ...this.patch,
        ...next,
        osc1: { ...this.patch.osc1, ...(next.osc1 || {}) },
        osc2: { ...this.patch.osc2, ...(next.osc2 || {}) },
        filter: { ...this.patch.filter, ...(next.filter || {}) },
        env: { ...this.patch.env, ...(next.env || {}) },
        effects: { ...this.patch.effects, ...(next.effects || {}) },
      };
      return;
    }
    if (message.type === 'param') {
      const segments = String(message.key || '').split('.');
      let target = this.patch;
      for (let i = 0; i < segments.length - 1; i += 1) {
        target = target?.[segments[i]];
        if (!target) return;
      }
      target[segments.at(-1)] = message.value;
      return;
    }
    if (message.type === 'noteOn') {
      this.noteOn(message.note, message.velocity ?? 0.82, message.id);
      return;
    }
    if (message.type === 'noteOff') {
      this.noteOff(message.note, message.id);
      return;
    }
    if (message.type === 'allNotesOff') {
      for (const voice of this.voices) this.releaseVoice(voice);
    }
  }

  noteOn(note, velocity, id) {
    const midi = clamp(Math.round(note), 12, 120);
    const maxUnison = 8;
    const voice = {
      note: midi,
      velocity: clamp(Number(velocity) || 0.82, 0, 1),
      id: id ?? `${midi}-${currentTime}-${Math.random()}`,
      stage: 0,
      envelope: 0,
      releaseStart: 0,
      releaseElapsed: 0,
      phase1: new Float32Array(maxUnison),
      phase2: new Float32Array(maxUnison),
      filterState: 0,
      filterLast: 0,
    };
    for (let i = 0; i < maxUnison; i += 1) {
      voice.phase1[i] = Math.random();
      voice.phase2[i] = Math.random();
    }
    this.voices.push(voice);
    if (this.voices.length > this.maxVoices) this.voices.shift();
  }

  releaseVoice(voice) {
    if (voice.stage === 3) return;
    voice.stage = 3;
    voice.releaseStart = Math.max(0.0001, voice.envelope);
    voice.releaseElapsed = 0;
  }

  noteOff(note, id) {
    const matches = this.voices.filter((voice) => voice.note === note && (id === undefined || voice.id === id) && voice.stage !== 3);
    for (const voice of matches) this.releaseVoice(voice);
  }

  getEnvelope(voice) {
    const envelope = this.patch.env || {};
    const attack = Math.max(0.003, Number(envelope.attack) || 0.003);
    const decay = Math.max(0.02, Number(envelope.decay) || 0.02);
    const sustain = clamp(Number(envelope.sustain), 0, 1);
    if (voice.stage === 0) {
      voice.envelope += 1 / (attack * sampleRate);
      if (voice.envelope >= 1) {
        voice.envelope = 1;
        voice.stage = 1;
      }
    }
    if (voice.stage === 1) {
      voice.envelope -= (1 - sustain) / (decay * sampleRate);
      if (voice.envelope <= sustain) {
        voice.envelope = sustain;
        voice.stage = 2;
      }
    }
    if (voice.stage === 2) voice.envelope = sustain;
    if (voice.stage === 3) {
      const release = Math.max(0.025, Number(envelope.release) || 0.025);
      voice.releaseElapsed += 1 / sampleRate;
      const progress = voice.releaseElapsed / release;
      voice.envelope = voice.releaseStart * Math.exp(-6.5 * progress);
      if (progress >= 1 || voice.envelope < 0.00015) voice.envelope = 0;
    }
    return voice.envelope;
  }

  oscillator(voice, oscillator, phases, sampleIndex) {
    if (!oscillator?.enabled) return 0;
    const count = clamp(Math.round(oscillator.unison || 1), 1, 8);
    const detune = clamp(Number(oscillator.detune) || 0, 0, 1);
    const semitones = (Number(oscillator.octave) || 0) * 12 + (Number(oscillator.semitone) || 0);
    const baseFrequency = 440 * 2 ** ((voice.note - 69 + semitones) / 12);
    const level = clamp(Number(oscillator.level) || 0, 0, 1);
    const pan = clamp(Number(oscillator.pan) || 0, -1, 1);
    let sum = 0;
    let panSum = 0;
    for (let i = 0; i < count; i += 1) {
      const spread = count > 1 ? (i / (count - 1) - 0.5) : 0;
      const cents = spread * detune * 90;
      const frequency = baseFrequency * 2 ** (cents / 1200);
      const phase = phases[i];
      sum += tableSample(oscillator.tables, phase, oscillator.position || 0, oscillator.wave || 'saw');
      panSum += pan + spread * (Number(this.patch.effects?.chorus) || 0) * 0.5;
      phases[i] = phase + frequency / sampleRate;
      if (phases[i] >= 1) phases[i] -= Math.floor(phases[i]);
    }
    const voicePan = clamp(panSum / count, -1, 1);
    return { sample: (sum / Math.sqrt(count)) * level, pan: voicePan, index: sampleIndex };
  }

  process(inputs, outputs) {
    const output = outputs[0];
    if (!output || !output.length) return true;
    const left = output[0];
    const right = output[1] || output[0];
    const patch = this.patch;
    const filter = patch.filter || {};
    const filterEnabled = filter.enabled !== false;
    const cutoff = clamp(Number(filter.cutoffHz) || 18000, 80, sampleRate * 0.46);
    const filterAlpha = 1 - Math.exp((-TAU * cutoff) / sampleRate);
    const resonance = clamp(Number(filter.resonance) || 0, 0, 0.92);
    const master = clamp(Number(patch.masterVolume) || 0, 0, 1.5);
    const effects = patch.effects || {};
    const delayMix = clamp(Number(effects.delay) || 0, 0, 1) * 0.44;
    const reverbMix = clamp(Number(effects.reverb) || 0, 0, 1) * 0.55;
    const feedback = 0.2 + delayMix * 0.62;
    const delaySamples = clamp(Math.floor(sampleRate * 0.285), 1, this.delaySize - 1);
    const drive = clamp((Number(effects.distortion) || 0) + (Number(filter.drive) || 0) * 0.35, 0, 0.85);
    const driveGain = 1 + drive * 9;
    const driveNorm = Math.tanh(driveGain);

    for (let i = 0; i < left.length; i += 1) {
      let dryL = 0;
      let dryR = 0;
      for (const voice of this.voices) {
        const envelope = this.getEnvelope(voice);
        if (envelope <= 0) continue;
        const a = this.oscillator(voice, patch.osc1, voice.phase1, i);
        const b = this.oscillator(voice, patch.osc2, voice.phase2, i);
        const sampleA = typeof a === 'number' ? 0 : a.sample;
        const sampleB = typeof b === 'number' ? 0 : b.sample;
        const panA = typeof a === 'number' ? 0 : a.pan;
        const panB = typeof b === 'number' ? 0 : b.pan;
        const sample = (sampleA + sampleB) * envelope * voice.velocity * 0.24;
        const pan = clamp((panA + panB) * 0.5, -1, 1);
        dryL += sample * Math.sqrt((1 - pan) * 0.5);
        dryR += sample * Math.sqrt((1 + pan) * 0.5);
      }

      if (filterEnabled) {
        this.filterStateL += filterAlpha * (dryL - this.filterStateL);
        this.filterStateR += filterAlpha * (dryR - this.filterStateR);
        dryL = this.filterStateL + (this.filterStateL - this.lastFilterL) * resonance * 0.22;
        dryR = this.filterStateR + (this.filterStateR - this.lastFilterR) * resonance * 0.22;
        this.lastFilterL = this.filterStateL;
        this.lastFilterR = this.filterStateR;
      }

      if (drive > 0) {
        dryL = Math.tanh(dryL * driveGain) / driveNorm;
        dryR = Math.tanh(dryR * driveGain) / driveNorm;
      }

      const readIndex = (this.delayIndex - delaySamples + this.delaySize) % this.delaySize;
      const delayOutL = this.delayL[readIndex];
      const delayOutR = this.delayR[readIndex];
      this.delayL[this.delayIndex] = dryL + delayOutL * feedback;
      this.delayR[this.delayIndex] = dryR + delayOutR * feedback;
      this.delayIndex = (this.delayIndex + 1) % this.delaySize;
      let wetL = dryL + delayOutL * delayMix;
      let wetR = dryR + delayOutR * delayMix;

      let verbL = 0;
      let verbR = 0;
      for (let line = 0; line < this.combsL.length; line += 1) {
        const indexL = this.combIndicesL[line];
        const indexR = this.combIndicesR[line];
        const bufferL = this.combsL[line];
        const bufferR = this.combsR[line];
        const sampleL = bufferL[indexL];
        const sampleR = bufferR[indexR];
        bufferL[indexL] = wetL + sampleL * 0.73;
        bufferR[indexR] = wetR + sampleR * 0.73;
        this.combIndicesL[line] = (indexL + 1) % bufferL.length;
        this.combIndicesR[line] = (indexR + 1) % bufferR.length;
        verbL += sampleL;
        verbR += sampleR;
      }
      wetL += (verbL / this.combsL.length) * reverbMix;
      wetR += (verbR / this.combsR.length) * reverbMix;
      left[i] = Math.tanh(wetL * master * 1.7);
      if (right !== left) right[i] = Math.tanh(wetR * master * 1.7);
    }

    for (let i = this.voices.length - 1; i >= 0; i -= 1) {
      if (this.voices[i].stage === 3 && this.voices[i].envelope <= 0) this.voices.splice(i, 1);
    }
    return true;
  }
}

registerProcessor('wavetable-processor', WavetableProcessor);
