import { decompress as decompressZstd } from 'fzstd';

export const PRESETS = [
  {
    id: 'zorg-lofi',
    file: 'ZORG_KY_Lofi_keys.vital',
    name: 'Lofi Keys',
    author: 'ZORG',
    category: 'Keys',
    format: 'VITAL',
    description: 'Soft-focus keys with a worn, wavering edge.',
    tint: 'violet',
    tags: ['Warm', 'Tape'],
  },
  {
    id: 'cyberpunk',
    file: 'Cyberpunk_2077.vital',
    name: 'Cyberpunk 2077',
    author: 'Flamedragonz',
    category: 'Lead',
    format: 'VITAL',
    description: 'A wide, cinematic lead built for the night shift.',
    tint: 'blue',
    tags: ['Wide', 'Cinematic'],
  },
  {
    id: 'future',
    file: 'NPMPR_The_Future.vital',
    name: 'The Future',
    author: 'PROTON',
    category: 'Lead',
    format: 'VITAL',
    description: 'Bright, glassy movement with a little bite.',
    tint: 'mint',
    tags: ['Motion', 'Bright'],
  },
  {
    id: 'pluggnb',
    file: 'Awesome Pluggnb Sine.SerumPreset',
    name: 'Pluggnb Sine',
    author: '@namelessonbandab',
    category: 'Keys',
    format: 'SERUM 2',
    description: 'A clean sine voice with a soft, rounded bottom.',
    tint: 'mint',
    tags: ['Sine', 'Mono'],
  },
  {
    id: 'espresso',
    file: 'BASS - GEEKED OFF 5 SHOTS OF ESPRESSO.SerumPreset',
    name: 'Geeked Off Espresso',
    author: 'SHARK',
    category: 'Bass',
    format: 'SERUM 2',
    description: 'Compact low end with a tight, driven midrange.',
    tint: 'amber',
    tags: ['Bass', 'Drive'],
  },
  {
    id: 'whirl',
    file: 'BASS - WHIRL.SerumPreset',
    name: 'Whirl',
    author: 'ZYAD',
    category: 'Bass',
    format: 'SERUM 2',
    description: 'A restless, detuned bass with a sweeping top.',
    tint: 'violet',
    tags: ['Bass', 'Unison'],
  },
  {
    id: 'screech',
    file: 'FX - SCREECH.SerumPreset',
    name: 'Screech',
    author: 'ZYAD',
    category: 'FX',
    format: 'SERUM 2',
    description: 'Razor-edged texture for a sharp transition or accent.',
    tint: 'rose',
    tags: ['FX', 'Rough'],
  },
  {
    id: 'camera',
    file: 'LEAD - CAMERA.SerumPreset',
    name: 'Camera',
    author: 'ZYAD',
    category: 'Lead',
    format: 'SERUM 2',
    description: 'A focused lead with a controlled, glossy spread.',
    tint: 'blue',
    tags: ['Lead', 'Wide'],
  },
  {
    id: 'scratch-made',
    file: 'LEAD - CREATED FROM SCRATCH.SerumPreset',
    name: 'Created From Scratch',
    author: 'SHARK',
    category: 'Lead',
    format: 'SERUM 2',
    description: 'An expressive custom patch with a softened attack.',
    tint: 'amber',
    tags: ['Lead', 'Custom'],
  },
  {
    id: 'crybaby',
    file: 'LEAD - CRYBABY.SerumPreset',
    name: 'Crybaby',
    author: 'ZYAD',
    category: 'Lead',
    format: 'SERUM 2',
    description: 'A vocal, bending lead with a pronounced filter color.',
    tint: 'rose',
    tags: ['Lead', 'Vocal'],
  },
  {
    id: 'baby-wah',
    file: 'SO_SYN_keys_baby_wah.fxp',
    name: 'Baby Wah',
    author: 'Sonic Academy',
    category: 'Keys',
    format: 'SERUM 1',
    description: 'A playful keyboard tone with a talking filter feel.',
    tint: 'amber',
    tags: ['Keys', 'Filter'],
  },
  {
    id: 'da-funk',
    file: 'SO_SYN_keys_da_funk.fxp',
    name: 'Da Funk',
    author: 'Sonic Academy',
    category: 'Keys',
    format: 'SERUM 1',
    description: 'A punchy, vintage-leaning synth keyboard.',
    tint: 'mint',
    tags: ['Keys', 'Classic'],
  },
  {
    id: 'fx-scratch',
    file: 'SO_SYN_fx_scratch.fxp',
    name: 'FX Scratch',
    author: 'Sonic Academy',
    category: 'FX',
    format: 'SERUM 1',
    description: 'A short, gritty gesture for transitions and fills.',
    tint: 'rose',
    tags: ['FX', 'Texture'],
  },
  {
    id: 'fx-wind',
    file: 'SO_SYN_fx_wind.fxp',
    name: 'FX Wind',
    author: 'Sonic Academy',
    category: 'FX',
    format: 'SERUM 1',
    description: 'An airy sweep that blooms into a soft noise bed.',
    tint: 'blue',
    tags: ['FX', 'Atmosphere'],
  },
];

export const DEMOS = [
  {
    id: 'afterglow',
    presetId: 'zorg-lofi',
    title: 'Afterglow',
    detail: 'LO-FI KEYS · 82 BPM',
    notes: [60, 64, 67, 71, 67, 64, 59, 62],
    durations: [0.42, 0.42, 0.42, 0.7, 0.42, 0.42, 0.42, 0.7],
    tint: 'violet',
  },
  {
    id: 'neon-drive',
    presetId: 'cyberpunk',
    title: 'Neon Drive',
    detail: 'CINEMATIC LEAD · 104 BPM',
    notes: [48, 55, 60, 63, 67, 63, 60, 55],
    durations: [0.28, 0.28, 0.28, 0.28, 0.55, 0.28, 0.28, 0.55],
    tint: 'blue',
  },
  {
    id: 'pluggnb-bounce',
    presetId: 'pluggnb',
    title: 'Pluggnb Bounce',
    detail: 'SERUM 2 · 138 BPM',
    notes: [60, 67, 72, 76, 72, 67, 64, 67],
    durations: [0.22, 0.22, 0.4, 0.22, 0.22, 0.4, 0.22, 0.4],
    tint: 'mint',
  },
  {
    id: 'low-orbit',
    presetId: 'whirl',
    title: 'Low Orbit',
    detail: 'BASS · 96 BPM',
    notes: [36, 36, 43, 38, 36, 31, 34, 36],
    durations: [0.44, 0.22, 0.44, 0.22, 0.44, 0.22, 0.22, 0.62],
    tint: 'amber',
  },
  {
    id: 'funk-machine',
    presetId: 'da-funk',
    title: 'Funk Machine',
    detail: 'SERUM 1 KEYS · 112 BPM',
    notes: [60, 63, 65, 67, 68, 67, 65, 63],
    durations: [0.27, 0.27, 0.27, 0.46, 0.27, 0.27, 0.27, 0.56],
    tint: 'mint',
  },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
const numberAt = (settings, key, fallback) => {
  const value = settings?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

function basePatch({ name, author, format, category, description, tint, fileName }) {
  const title = `${name} ${category || ''} ${fileName || ''}`.toLowerCase();
  const isBass = /bass|sub|808|whirl|espresso|orbit/.test(title);
  const isFx = /fx|screech|scratch|wind|texture/.test(title);
  const isKeys = /keys|piano|sine|lofi|funk|wah/.test(title);
  const isSine = /sine|pluggnb/.test(title);
  const isWah = /wah|crybaby/.test(title);
  const isBright = /future|camera|cyberpunk|screech/.test(title);
  const wave = isSine ? 'sine' : isKeys ? 'triangle' : isFx ? 'saw' : 'saw';
  const wave2 = isBass ? 'square' : isKeys ? 'sine' : 'triangle';

  return {
    name: name || 'Untitled patch',
    author: author || 'Unknown artist',
    format: format || 'LOCAL',
    category: category || (isBass ? 'Bass' : isFx ? 'FX' : isKeys ? 'Keys' : 'Lead'),
    description: description || 'Imported patch, ready to play.',
    tint: tint || (isBass ? 'amber' : isFx ? 'rose' : 'violet'),
    fileName: fileName || '',
    engineNote: 'Web engine · preset controls mapped for playback',
    osc1: {
      enabled: true,
      wave,
      tableName: isSine ? 'Sine' : isKeys ? 'Soft triangle' : isFx ? 'Scrape' : 'Bright saw',
      tables: null,
      position: 0.18,
      level: isBass ? 0.82 : isFx ? 0.62 : isKeys ? 0.68 : 0.72,
      octave: isBass ? -1 : 0,
      semitone: 0,
      unison: isBass ? 2 : isFx ? 3 : isKeys ? 1 : 4,
      detune: isBass ? 0.12 : 0.24,
      pan: -0.08,
    },
    osc2: {
      enabled: isSine ? false : true,
      wave: wave2,
      tableName: isBass ? 'Sub square' : 'Counter shape',
      tables: null,
      position: 0.46,
      level: isBass ? 0.3 : isFx ? 0.2 : isKeys ? 0.23 : 0.27,
      octave: isBass ? -1 : 0,
      semitone: isBright ? 7 : 0,
      unison: isBass ? 1 : 2,
      detune: 0.12,
      pan: 0.1,
    },
    filter: {
      enabled: true,
      cutoffHz: isBass ? 620 : isFx ? 5200 : isBright ? 2600 : 1900,
      resonance: isWah ? 0.58 : isBass ? 0.28 : 0.18,
      drive: isFx || isBright ? 0.28 : isBass ? 0.22 : 0.06,
    },
    env: {
      attack: isFx ? 0.08 : isKeys ? 0.018 : 0.012,
      decay: isBass ? 0.46 : isFx ? 0.86 : 0.72,
      sustain: isBass ? 0.74 : isFx ? 0.32 : isKeys ? 0.5 : 0.7,
      release: isBass ? 0.28 : isFx ? 1.05 : isKeys ? 0.72 : 0.48,
    },
    effects: {
      reverb: isKeys || isFx ? 0.2 : 0.1,
      delay: isBright ? 0.12 : isFx ? 0.08 : 0.04,
      distortion: isFx ? 0.27 : isBass ? 0.14 : isBright ? 0.11 : 0.035,
      chorus: isKeys || isBright ? 0.16 : 0.06,
    },
    macros: [
      { name: 'MOTION', value: 0.34 },
      { name: 'SPACE', value: isKeys || isFx ? 0.56 : 0.28 },
      { name: 'TONE', value: isBass ? 0.44 : 0.62 },
      { name: 'DRIVE', value: isFx ? 0.45 : 0.28 },
    ],
    masterVolume: 0.8,
  };
}

function decodeVitalFrames(wavetable) {
  const keyframes = wavetable?.groups?.[0]?.components?.[0]?.keyframes || [];
  const frames = [];
  for (const keyframe of keyframes) {
    if (typeof keyframe?.wave_data !== 'string') continue;
    try {
      const binary = atob(keyframe.wave_data);
      const count = Math.floor(binary.length / 4);
      if (!count) continue;
      const bytes = new Uint8Array(count * 4);
      for (let i = 0; i < bytes.length; i += 1) bytes[i] = binary.charCodeAt(i);
      const view = new DataView(bytes.buffer);
      const frame = new Float32Array(count);
      for (let i = 0; i < count; i += 1) frame[i] = view.getFloat32(i * 4, true);
      frames.push(frame);
    } catch {
      // An unavailable or malformed user wavetable falls back to a basic oscillator.
    }
  }
  return frames.length ? frames : null;
}

function vitalOscillator(settings, index, fallback) {
  const prefix = `osc_${index}`;
  const frames = decodeVitalFrames(settings?.wavetables?.[index - 1]);
  const rawFrame = numberAt(settings, `${prefix}_wave_frame`, 0);
  const frameCount = frames?.length || 1;
  return {
    ...fallback,
    enabled: numberAt(settings, `${prefix}_on`, fallback.enabled ? 1 : 0) > 0.5,
    wave: frames ? 'table' : fallback.wave,
    tableName: settings?.wavetables?.[index - 1]?.name || fallback.tableName,
    tables: frames,
    position: clamp(rawFrame / Math.max(1, frameCount - 1), 0, 1),
    level: clamp(numberAt(settings, `${prefix}_level`, fallback.level), 0, 1),
    octave: Math.trunc(numberAt(settings, `${prefix}_transpose`, fallback.octave * 12) / 12),
    semitone: numberAt(settings, `${prefix}_transpose`, fallback.octave * 12) % 12,
    unison: clamp(Math.round(numberAt(settings, `${prefix}_unison_voices`, fallback.unison)), 1, 8),
    detune: clamp(numberAt(settings, `${prefix}_unison_detune`, fallback.detune) / 8, 0, 1),
    pan: clamp(numberAt(settings, `${prefix}_pan`, fallback.pan), -1, 1),
  };
}

function parseVital(data, catalogEntry) {
  const settings = data?.settings || {};
  const name = catalogEntry?.name || data?.preset_name || 'Vital patch';
  const author = catalogEntry?.author || data?.author || 'Unknown artist';
  const patch = basePatch({
    name,
    author,
    format: 'VITAL',
    category: catalogEntry?.category,
    description: catalogEntry?.description,
    tint: catalogEntry?.tint,
    fileName: catalogEntry?.file,
  });

  patch.osc1 = vitalOscillator(settings, 1, patch.osc1);
  patch.osc2 = vitalOscillator(settings, 2, patch.osc2);
  const cutoffNote = numberAt(settings, 'filter_1_cutoff', 78);
  patch.filter = {
    ...patch.filter,
    enabled: numberAt(settings, 'filter_1_on', 1) > 0.5 && numberAt(settings, 'filter_1_mix', 1) > 0.01,
    cutoffHz: clamp(440 * 2 ** ((cutoffNote - 69) / 12), 80, 18000),
    resonance: clamp(numberAt(settings, 'filter_1_resonance', patch.filter.resonance), 0, 0.92),
    drive: clamp(numberAt(settings, 'filter_1_drive', patch.filter.drive) / 12, 0, 0.65),
  };
  patch.env = {
    attack: clamp(numberAt(settings, 'env_1_attack', patch.env.attack), 0.004, 4),
    decay: clamp(numberAt(settings, 'env_1_decay', patch.env.decay), 0.03, 5),
    sustain: clamp(numberAt(settings, 'env_1_sustain', patch.env.sustain), 0, 1),
    release: clamp(numberAt(settings, 'env_1_release', patch.env.release), 0.03, 6),
  };
  patch.effects = {
    reverb: clamp(numberAt(settings, 'reverb_dry_wet', patch.effects.reverb), 0, 1),
    delay: clamp(numberAt(settings, 'delay_dry_wet', patch.effects.delay), 0, 1),
    distortion: clamp(numberAt(settings, 'distortion_mix', patch.effects.distortion), 0, 1),
    chorus: clamp(numberAt(settings, 'chorus_dry_wet', patch.effects.chorus), 0, 1),
  };
  patch.macros = [1, 2, 3, 4].map((macroIndex, index) => ({
    name: String(data?.[`macro${macroIndex}`] || ['MOTION', 'SPACE', 'TONE', 'DRIVE'][index]).toUpperCase().slice(0, 12),
    value: clamp(numberAt(settings, `macro_control_${macroIndex}`, patch.macros[index].value), 0, 1),
  }));
  patch.engineNote = 'Vital patch · embedded wavetable frames loaded';
  return patch;
}

function readSerumJsonHeader(bytes) {
  let start = -1;
  for (let i = 0; i < Math.min(bytes.length, 64); i += 1) {
    if (bytes[i] === 123) {
      start = i;
      break;
    }
  }
  if (start < 0) return {};
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < bytes.length; i += 1) {
    const char = bytes[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === 92) escaped = true;
      else if (char === 34) inString = false;
      continue;
    }
    if (char === 34) inString = true;
    else if (char === 123) depth += 1;
    else if (char === 125) {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(new TextDecoder().decode(bytes.subarray(start, i + 1)));
        } catch {
          return {};
        }
      }
    }
  }
  return {};
}

const PARAM_BYTES = new Map();
function bytesFor(text) {
  if (!PARAM_BYTES.has(text)) PARAM_BYTES.set(text, new TextEncoder().encode(text));
  return PARAM_BYTES.get(text);
}

function allSerumValues(data, key) {
  const needle = bytesFor(key);
  const values = [];
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  outer: for (let start = 0; start <= data.length - needle.length; start += 1) {
    for (let i = 0; i < needle.length; i += 1) {
      if (data[start + i] !== needle[i]) continue outer;
    }
    const marker = data[start + needle.length];
    const offset = start + needle.length + 1;
    if (marker === 0xfb && offset + 8 <= data.length) {
      const value = view.getFloat64(offset, false);
      if (Number.isFinite(value)) values.push(value);
    } else if (marker === 0xfa && offset + 4 <= data.length) {
      const value = view.getFloat32(offset, false);
      if (Number.isFinite(value)) values.push(value);
    }
    start += needle.length - 1;
  }
  return values;
}

function extractZstdState(bytes) {
  const magic = [0x28, 0xb5, 0x2f, 0xfd];
  for (let i = 0; i <= bytes.length - magic.length; i += 1) {
    if (bytes[i] === magic[0] && bytes[i + 1] === magic[1] && bytes[i + 2] === magic[2] && bytes[i + 3] === magic[3]) {
      try {
        return decompressZstd(bytes.subarray(i));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function parseSerum(bytes, catalogEntry, fileName, isSerum1 = false) {
  const metadata = isSerum1 ? {} : readSerumJsonHeader(bytes);
  const fallbackName = catalogEntry?.name || fileName.replace(/\.(SerumPreset|fxp)$/i, '').replace(/[_-]+/g, ' ').trim();
  const name = catalogEntry?.name || metadata.presetName || fallbackName || 'Serum patch';
  const author = catalogEntry?.author || metadata.presetAuthor || 'Imported preset';
  const format = isSerum1 ? 'SERUM 1' : 'SERUM 2';
  const patch = basePatch({
    name,
    author,
    format,
    category: catalogEntry?.category,
    description: catalogEntry?.description,
    tint: catalogEntry?.tint,
    fileName,
  });
  const state = !isSerum1 ? extractZstdState(bytes) : null;
  if (state) {
    const read = (key) => allSerumValues(state, `kParam${key}`);
    const attack = read('Attack')[0];
    const decay = read('Decay')[0];
    const sustain = read('Sustain')[0];
    const release = read('Release')[0];
    if (attack !== undefined) patch.env.attack = clamp(attack, 0.003, 4);
    if (decay !== undefined) patch.env.decay = clamp(decay, 0.03, 5);
    if (sustain !== undefined) patch.env.sustain = clamp(sustain, 0, 1);
    if (release !== undefined) patch.env.release = clamp(release, 0.025, 6);

    const volumes = read('Volume');
    const tablePositions = read('TablePos');
    const unisons = read('Unison');
    const detunes = read('Detune');
    const octaves = read('Octave');
    const toLevel = (value, fallback) => value === undefined ? fallback : clamp(value, 0, 1);
    if (volumes[0] !== undefined) patch.osc1.level = toLevel(volumes[0], patch.osc1.level);
    if (volumes[1] !== undefined) patch.osc2.level = toLevel(volumes[1], patch.osc2.level);
    if (unisons[0] !== undefined) patch.osc1.unison = clamp(Math.round(unisons[0]), 1, 8);
    if (unisons[1] !== undefined) patch.osc2.unison = clamp(Math.round(unisons[1]), 1, 8);
    if (detunes[0] !== undefined) patch.osc1.detune = clamp(detunes[0], 0, 1);
    if (detunes[1] !== undefined) patch.osc2.detune = clamp(detunes[1], 0, 1);
    if (octaves[0] !== undefined) patch.osc1.octave = Math.trunc(octaves[0]);
    if (octaves[1] !== undefined) patch.osc2.octave = Math.trunc(octaves[1]);
    if (tablePositions[0] !== undefined) patch.osc1.position = clamp(tablePositions[0] / 256, 0, 1);
    if (tablePositions[1] !== undefined) patch.osc2.position = clamp(tablePositions[1] / 256, 0, 1);
    const frequency = read('Freq');
    const resonance = read('Reso');
    if (frequency.length) {
      const raw = frequency.at(-1);
      patch.filter.cutoffHz = raw > 0 && raw <= 1 ? 80 * 2 ** (raw * 8) : clamp(raw, 100, 18000);
    }
    if (resonance.length) patch.filter.resonance = clamp(resonance.at(-1) / 100, 0, 0.92);
    const wet = read('Wet');
    if (wet.length) patch.effects.reverb = clamp(wet.at(-1) / 100, 0, 0.8);
    const hasMappedValues = [attack, decay, sustain, release, ...volumes, ...tablePositions, ...unisons, ...detunes, ...octaves, ...frequency, ...resonance, ...wet].some((value) => value !== undefined);
    patch.engineNote = hasMappedValues
      ? 'Serum 2 state unpacked · core controls mapped to the web engine'
      : 'Serum 2 preset header read · playback approximation';
  } else {
    patch.engineNote = isSerum1
      ? 'Serum 1 preset · browser playback approximation'
      : 'Serum preset · browser playback approximation';
  }
  patch.format = format;
  return patch;
}

export async function parsePresetFile(file, catalogEntry = null) {
  const fileName = file?.name || catalogEntry?.file || 'Imported patch';
  const lowerName = fileName.toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (lowerName.endsWith('.vital')) {
    const data = JSON.parse(new TextDecoder().decode(bytes));
    return parseVital(data, catalogEntry);
  }
  if (lowerName.endsWith('.fxp')) return parseSerum(bytes, catalogEntry, fileName, true);
  if (lowerName.endsWith('.serumpreset')) return parseSerum(bytes, catalogEntry, fileName, false);
  throw new Error('Choose a .vital, .SerumPreset, or .fxp file.');
}

export function getPresetById(id) {
  return PRESETS.find((preset) => preset.id === id) || null;
}
