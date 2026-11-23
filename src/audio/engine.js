function clonePatchForWorklet(patch) {
  const copy = {
    ...patch,
    osc1: { ...patch.osc1 },
    osc2: { ...patch.osc2 },
    filter: { ...patch.filter },
    env: { ...patch.env },
    effects: { ...patch.effects },
  };
  const transfer = [];
  for (const oscillator of [copy.osc1, copy.osc2]) {
    if (!oscillator.tables?.length) continue;
    oscillator.tables = oscillator.tables.map((frame) => {
      const frameCopy = new Float32Array(frame);
      transfer.push(frameCopy.buffer);
      return frameCopy;
    });
  }
  return { copy, transfer };
}


export class WavetableEngine {
  constructor(onStatus = () => {}) {
    this.context = null;
    this.node = null;
    this.startPromise = null;
    this.currentPatch = null;
    this.status = 'idle';
    this.onStatus = onStatus;
    this.noteSequence = 0;
    this.phraseTimers = [];
    this.phraseNotes = [];
    this.phraseActive = false;
  }

  setStatus(status, detail = '') {
    this.status = status;
    this.onStatus(status, detail);
  }

  async ensureStarted() {
    if (this.node && this.context) {
      if (this.context.state !== 'running') await this.context.resume();
      this.setStatus('active');
      return this.node;
    }
    if (this.startPromise) return this.startPromise;

    this.setStatus('starting');
    this.startPromise = (async () => {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Web Audio is not available in this browser.');
      this.context = new AudioContextClass({ latencyHint: 'interactive' });
      const resumePromise = this.context.resume();
      if (!this.context.audioWorklet) throw new Error('AudioWorklet is not available. Try a current version of Chrome, Safari, or Firefox.');
      await this.context.audioWorklet.addModule('/synth-processor.js');
      this.node = new AudioWorkletNode(this.context, 'wavetable-processor', {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        channelCount: 2,
        channelCountMode: 'explicit',
      });
      this.node.connect(this.context.destination);
      if (this.currentPatch) this.sendPatch(this.currentPatch);
      await resumePromise;
      if (this.context.state !== 'running') await this.context.resume();
      this.setStatus('active');
      return this.node;
    })().catch((error) => {
      this.setStatus('error', error?.message || 'Could not start audio.');
      this.startPromise = null;
      throw error;
    });
    return this.startPromise;
  }

  sendPatch(patch) {
    if (!this.node) return;
    const { copy, transfer } = clonePatchForWorklet(patch);
    this.node.port.postMessage({ type: 'preset', patch: copy }, transfer);
  }

  setPatch(patch) {
    this.currentPatch = patch;
    if (this.node) this.sendPatch(patch);
  }

  setParam(key, value) {
    if (this.currentPatch) {
      const parts = key.split('.');
      if (parts.length === 1) {
        this.currentPatch = { ...this.currentPatch, [parts[0]]: value };
      } else {
        const [section, property] = parts;
        this.currentPatch = {
          ...this.currentPatch,
          [section]: { ...this.currentPatch[section], [property]: value },
        };
      }
    }
    if (this.node) this.node.port.postMessage({ type: 'param', key, value });
  }

  noteOn(note, velocity = 0.82, id) {
    const voiceId = id ?? `voice-${++this.noteSequence}`;
    this.ensureStarted()
      .then((node) => node.port.postMessage({ type: 'noteOn', note, velocity, id: voiceId }))
      .catch(() => {});
    return voiceId;
  }

  noteOff(note, id) {
    if (this.node) {
      this.node.port.postMessage({ type: 'noteOff', note, id });
      return;
    }
    this.ensureStarted()
      .then((node) => node.port.postMessage({ type: 'noteOff', note, id }))
      .catch(() => {});
  }

  allNotesOff() {
    if (this.node) this.node.port.postMessage({ type: 'allNotesOff' });
  }

  playPhrase(demo, onStop = () => {}) {
    this.stopPhrase(false);
    this.phraseActive = true;
    const notes = demo.notes || [];
    const durations = demo.durations || [];
    this.phraseNotes = [];
    let cursor = 0;
    for (let index = 0; index < notes.length; index += 1) {
      const note = notes[index];
      const duration = durations[index] || 0.35;
      const id = `phrase-${++this.noteSequence}-${index}`;
      this.phraseNotes.push({ note, id });
      this.phraseTimers.push(window.setTimeout(() => this.noteOn(note, 0.82, id), cursor * 1000));
      this.phraseTimers.push(window.setTimeout(() => this.noteOff(note, id), (cursor + duration * 0.72) * 1000));
      cursor += duration;
    }
    this.phraseTimers.push(window.setTimeout(() => {
      this.phraseActive = false;
      this.phraseTimers = [];
      this.phraseNotes = [];
      onStop();
    }, (cursor + 0.3) * 1000));
  }

  stopPhrase(notify = true) {
    for (const timer of this.phraseTimers) window.clearTimeout(timer);
    this.phraseTimers = [];
    const wasActive = this.phraseActive;
    this.phraseActive = false;
    if (wasActive) {
      for (const voice of this.phraseNotes) this.noteOff(voice.note, voice.id);
    }
    this.phraseNotes = [];
    if (notify && wasActive) this.onStatus(this.status, 'phrase-stopped');
  }
}
