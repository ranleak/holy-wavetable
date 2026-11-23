import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AudioLines,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Disc3,
  Heart,
  Keyboard,
  ListMusic,
  LoaderCircle,
  Menu,
  Music2,
  Pause,
  Play,
  Power,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Volume2,
  Waves,
  X,
  Zap,
} from 'lucide-react';
import { WavetableEngine } from './audio/engine.js';
import { DEMOS, getPresetById, parsePresetFile, PRESETS } from './lib/presets.js';

const KEYBOARD_MAP = {
  a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7,
  y: 8, h: 9, u: 10, j: 11, k: 12,
};
const BLACK_PITCHES = new Set([1, 3, 6, 8, 10]);
const FILTER_CATEGORIES = ['ALL', 'BASS', 'LEAD', 'KEYS', 'FX'];

const formatClasses = (format = '') => {
  if (format.includes('VITAL')) return 'format-vital';
  if (format.includes('1')) return 'format-serum-one';
  return 'format-serum-two';
};

function displayHz(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(value > 10000 ? 0 : 1)} kHz`;
  return `${Math.round(value)} Hz`;
}

function WaveCanvas({ oscillator, tint = 'violet', compact = false }) {
  const canvasRef = useRef(null);
  const oscillatorRef = useRef(oscillator);
  oscillatorRef.current = oscillator;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return undefined;
    let animationFrame = 0;
    const colors = {
      violet: ['#bd9cff', '#9a68ff'],
      blue: ['#8ecbff', '#59aaff'],
      mint: ['#a0f3d4', '#5be0b0'],
      amber: ['#ffd394', '#ffad4f'],
      rose: ['#ffa4c5', '#ff6f9e'],
    };
    const [glow, line] = colors[tint] || colors.violet;
    const startedAt = performance.now();

    const draw = (time) => {
      const width = canvas.clientWidth || 300;
      const height = canvas.clientHeight || 96;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * pixelRatio) || canvas.height !== Math.round(height * pixelRatio)) {
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
      }
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = 'rgba(9, 12, 19, 0.92)';
      context.fillRect(0, 0, width, height);
      context.strokeStyle = 'rgba(157, 171, 204, 0.075)';
      context.lineWidth = 1;
      for (let x = 0; x < width; x += width / 8) {
        context.beginPath(); context.moveTo(x, 8); context.lineTo(x, height - 8); context.stroke();
      }
      context.beginPath(); context.moveTo(0, height / 2); context.lineTo(width, height / 2); context.stroke();

      const current = oscillatorRef.current;
      const tables = current?.tables;
      let frame = null;
      if (tables?.length) {
        const framePosition = Math.min(1, Math.max(0, current.position || 0)) * (tables.length - 1);
        const lowFrame = Math.floor(framePosition);
        const highFrame = Math.min(tables.length - 1, lowFrame + 1);
        const blend = framePosition - lowFrame;
        frame = { low: tables[lowFrame], high: tables[highFrame], blend };
      }
      const phaseOffset = ((time - startedAt) / (compact ? 5800 : 7600)) % 1;
      const samples = Math.max(240, Math.round(width * 1.2));
      const mid = height / 2;
      const amplitude = height * (compact ? 0.28 : 0.34);
      const shapeSample = (phase) => {
        if (frame?.low?.length) {
          const sampleAt = (table, index) => {
            const point = index * table.length;
            const i = Math.floor(point) % table.length;
            const next = (i + 1) % table.length;
            const fraction = point - Math.floor(point);
            return table[i] + (table[next] - table[i]) * fraction;
          };
          const a = sampleAt(frame.low, phase);
          const b = frame.high ? sampleAt(frame.high, phase) : a;
          return a + (b - a) * frame.blend;
        }
        const shape = current?.wave || 'saw';
        if (shape === 'sine') return Math.sin(phase * Math.PI * 2);
        if (shape === 'triangle') return 1 - 4 * Math.abs(phase - 0.5);
        if (shape === 'square') return phase < 0.5 ? 1 : -1;
        return phase * 2 - 1;
      };
      const gradient = context.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, line);
      gradient.addColorStop(0.5, glow);
      gradient.addColorStop(1, line);
      context.shadowBlur = 16;
      context.shadowColor = glow;
      context.strokeStyle = gradient;
      context.lineWidth = compact ? 1.5 : 2;
      context.beginPath();
      for (let i = 0; i <= samples; i += 1) {
        const ratio = i / samples;
        const phase = (ratio + phaseOffset) % 1;
        const y = mid - shapeSample(phase) * amplitude;
        if (i === 0) context.moveTo(ratio * width, y);
        else context.lineTo(ratio * width, y);
      }
      context.stroke();
      context.shadowBlur = 0;
      const playheadX = ((time - startedAt) / (compact ? 1700 : 2100) % 1) * width;
      const playhead = context.createLinearGradient(0, 0, 0, height);
      playhead.addColorStop(0, 'rgba(255,255,255,0)');
      playhead.addColorStop(0.5, 'rgba(255,255,255,0.34)');
      playhead.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = playhead;
      context.fillRect(playheadX, 4, 1, height - 8);
      animationFrame = requestAnimationFrame(draw);
    };
    animationFrame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrame);
  }, [tint, compact]);

  return <canvas ref={canvasRef} className={`wave-canvas ${compact ? 'wave-canvas-compact' : ''}`} aria-label={`${oscillator?.tableName || oscillator?.wave || 'Wavetable'} waveform`} />;
}

function Knob({ label, value, min = 0, max = 1, step = 0.01, onChange, displayValue, size = 'regular', color = 'violet' }) {
  const numericValue = Number(value) || 0;
  const ratio = max === min ? 0 : Math.max(0, Math.min(1, (numericValue - min) / (max - min)));
  const angle = -135 + ratio * 270;
  return (
    <div className={`knob-wrap knob-${size}`}>
      <div className={`knob-face knob-${color}`} style={{ '--knob-angle': `${angle}deg`, '--knob-progress': `${ratio * 75}%` }}>
        <input
          aria-label={label}
          type="range"
          min={min}
          max={max}
          step={step}
          value={numericValue}
          onChange={(event) => onChange(Number(event.target.value))}
          className="knob-input"
        />
        <span className="knob-center"><span className="knob-indicator" /></span>
      </div>
      <span className="knob-label">{label}</span>
      <span className="knob-value">{displayValue ?? numericValue.toFixed(2)}</span>
    </div>
  );
}

function InlineSlider({ label, value, min = 0, max = 1, step = 0.01, onChange, displayValue, tint = 'violet' }) {
  const ratio = max === min ? 0 : Math.max(0, Math.min(1, (value - min) / (max - min)));
  return (
    <label className={`inline-slider tint-${tint}`}>
      <span className="slider-label-row"><span>{label}</span><b>{displayValue ?? `${Math.round(ratio * 100)}%`}</b></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function OscillatorCard({ letter, oscillator, patchTint, onParam, toggle, active }) {
  const path = `osc${letter === 'A' ? '1' : '2'}`;
  const color = letter === 'A' ? patchTint : 'blue';
  return (
    <section className={`osc-card ${!oscillator.enabled ? 'osc-muted' : ''}`}>
      <div className="osc-head">
        <div className="osc-title-group">
          <span className={`osc-badge tint-${color}`}>{letter}</span>
          <div>
            <div className="osc-title">OSCILLATOR {letter}</div>
            <div className="osc-subtitle">{oscillator.tableName || oscillator.wave || 'Basic shape'}</div>
          </div>
        </div>
        <button className={`tiny-toggle ${oscillator.enabled ? 'is-on' : ''}`} onClick={() => toggle(`${path}.enabled`, !oscillator.enabled)} aria-label={`Toggle oscillator ${letter}`} aria-pressed={oscillator.enabled}>
          <span />
        </button>
      </div>
      <div className="osc-wave-wrap">
        <WaveCanvas oscillator={oscillator} tint={color} />
        <div className="wave-overlay-label"><span>WT / {oscillator.tables?.length ? 'MULTI-FRAME' : 'SINGLE CYCLE'}</span><span>{String(Math.round((oscillator.position || 0) * 100)).padStart(2, '0')}%</span></div>
      </div>
      <div className="osc-controls">
        <InlineSlider
          label="WT POSITION"
          value={oscillator.position || 0}
          onChange={(value) => onParam(`${path}.position`, value)}
          displayValue={String(Math.round((oscillator.position || 0) * 100)).padStart(2, '0')}
          tint={color}
        />
        <InlineSlider
          label="LEVEL"
          value={oscillator.level || 0}
          onChange={(value) => onParam(`${path}.level`, value)}
          displayValue={`${Math.round((oscillator.level || 0) * 100)}%`}
          tint={color}
        />
        <div className="unison-chip"><span>UNI</span><b>{oscillator.unison || 1}</b></div>
      </div>
      {!oscillator.enabled && <div className="osc-disabled-overlay">OSCILLATOR OFF</div>}
    </section>
  );
}

function PresetRow({ preset, selected, favorite, loading, onSelect, onFavorite }) {
  const initials = preset.format.includes('VITAL') ? 'V' : preset.format.includes('1') ? 'S1' : 'S2';
  return (
    <div className={`preset-row ${selected ? 'is-selected' : ''}`}>
      <button className="preset-select" onClick={onSelect} aria-current={selected ? 'true' : undefined}>
        <span className={`preset-orb tint-${preset.tint || 'violet'}`}><Disc3 size={17} strokeWidth={1.8} /></span>
        <span className="preset-row-copy">
          <span className="preset-row-name">{loading && <LoaderCircle className="loading-icon" size={12} />}{preset.name}</span>
          <span className="preset-row-author">{preset.author || 'Unknown artist'} <span>·</span> {preset.category || 'Preset'}</span>
        </span>
        <span className={`mini-format ${formatClasses(preset.format)}`}>{initials}</span>
      </button>
      <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={onFavorite} aria-label={favorite ? 'Remove favorite' : 'Add favorite'}>
        <Heart size={13} fill={favorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}

function DemoRow({ demo, preset, active, onClick }) {
  return (
    <button className={`demo-row ${active ? 'demo-playing' : ''}`} onClick={onClick}>
      <span className={`demo-play-icon tint-${demo.tint}`}>{active ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}</span>
      <span className="demo-row-copy"><b>{demo.title}</b><small>{demo.detail}</small></span>
      <span className="demo-row-preset">{preset?.name}</span>
    </button>
  );
}

function App() {
  const [patch, setPatch] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [loadingPresetId, setLoadingPresetId] = useState(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [showDemos, setShowDemos] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(['zorg-lofi', 'cyberpunk']));
  const [audioStatus, setAudioStatus] = useState('idle');
  const [volume, setVolume] = useState(0.8);
  const [octaveShift, setOctaveShift] = useState(0);
  const [activeNotes, setActiveNotes] = useState(() => new Set());
  const [playingDemoId, setPlayingDemoId] = useState(null);
  const [toast, setToast] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const engineRef = useRef(null);
  const volumeRef = useRef(0.8);
  const fileInputRef = useRef(null);
  const heldKeyboardNotes = useRef(new Map());
  const toastTimer = useRef(null);
  const loadingGuard = useRef(0);

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3100);
  }, []);

  useEffect(() => {
    const engine = new WavetableEngine((status, detail) => {
      setAudioStatus(status);
      if (status === 'error' && detail) notify(detail);
    });
    engineRef.current = engine;
    return () => {
      engine.stopPhrase();
      engine.context?.close();
      window.clearTimeout(toastTimer.current);
    };
  }, [notify]);

  const loadPreset = useCallback(async (entry, { silent = false } = {}) => {
    if (!entry) return;
    const requestId = ++loadingGuard.current;
    setLoadingPresetId(entry.id);
    setSidebarOpen(false);
    if (engineRef.current?.phraseActive) {
      engineRef.current.stopPhrase();
      setPlayingDemoId(null);
    }
    try {
      let file;
      if (entry.file) {
        const response = await fetch(`/presets/${encodeURIComponent(entry.file)}`);
        if (!response.ok) throw new Error(`Could not load ${entry.file}.`);
        const blob = await response.blob();
        file = { name: entry.file, arrayBuffer: () => blob.arrayBuffer() };
      } else {
        throw new Error('This preset does not have an available source file.');
      }
      const nextPatch = await parsePresetFile(file, entry);
      if (requestId !== loadingGuard.current) return;
      nextPatch.masterVolume = volumeRef.current;
      setPatch(nextPatch);
      setSelectedPreset(entry);
      engineRef.current?.setPatch(nextPatch);
      if (!silent) notify(`Loaded ${nextPatch.name} · ${nextPatch.format}`);
    } catch (error) {
      if (requestId === loadingGuard.current) notify(error?.message || 'Could not load this preset.');
    } finally {
      if (requestId === loadingGuard.current) setLoadingPresetId(null);
    }
  }, [notify]);

  useEffect(() => {
    loadPreset(PRESETS[0], { silent: true });
  }, [loadPreset]);

  const setParam = useCallback((path, value) => {
    setPatch((previous) => {
      if (!previous) return previous;
      const parts = path.split('.');
      if (parts.length === 1) return { ...previous, [parts[0]]: value };
      const [section, key] = parts;
      return { ...previous, [section]: { ...previous[section], [key]: value } };
    });
    engineRef.current?.setParam(path, value);
  }, []);

  const toggleFavorite = useCallback((id) => {
    setFavoriteIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const visiblePresets = useMemo(() => PRESETS.filter((preset) => {
    const searchText = `${preset.name} ${preset.author} ${preset.category} ${preset.format} ${preset.tags.join(' ')}`.toLowerCase();
    const matchesQuery = searchText.includes(query.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || preset.category.toUpperCase() === categoryFilter;
    const matchesFormat = formatFilter === 'ALL'
      || (formatFilter === 'SERUM' && preset.format.includes('SERUM'))
      || (formatFilter === 'VITAL' && preset.format.includes('VITAL'));
    const matchesFavorite = !favoriteOnly || favoriteIds.has(preset.id);
    return matchesQuery && matchesCategory && matchesFormat && matchesFavorite;
  }), [categoryFilter, favoriteIds, favoriteOnly, formatFilter, query]);

  const matchingDemo = DEMOS.find((demo) => demo.presetId === selectedPreset?.id) || DEMOS[0];

  const activateAudio = useCallback(() => {
    engineRef.current?.ensureStarted().catch(() => {});
  }, []);

  const playDemo = useCallback(async (demo = matchingDemo) => {
    if (!demo) return;
    if (engineRef.current?.phraseActive) {
      engineRef.current.stopPhrase();
      setPlayingDemoId(null);
      return;
    }
    if (selectedPreset?.id !== demo.presetId) {
      const entry = getPresetById(demo.presetId);
      if (entry) await loadPreset(entry, { silent: true });
    }
    engineRef.current?.playPhrase(demo, () => setPlayingDemoId(null));
    setPlayingDemoId(demo.id);
  }, [loadPreset, matchingDemo, selectedPreset?.id]);

  const loadAndPlayDemo = useCallback(async (demo) => {
    const entry = getPresetById(demo.presetId);
    if (entry && selectedPreset?.id !== entry.id) await loadPreset(entry, { silent: true });
    engineRef.current?.playPhrase(demo, () => setPlayingDemoId(null));
    setPlayingDemoId(demo.id);
  }, [loadPreset, selectedPreset?.id]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      if (event.code === 'Space') {
        event.preventDefault();
        if (!event.repeat) playDemo();
        return;
      }
      const key = event.key.toLowerCase();
      if (!(key in KEYBOARD_MAP) || event.repeat) return;
      event.preventDefault();
      if (heldKeyboardNotes.current.has(key)) return;
      const note = 60 + octaveShift * 12 + KEYBOARD_MAP[key];
      heldKeyboardNotes.current.set(key, note);
      engineRef.current?.noteOn(note, 0.8);
      setActiveNotes((previous) => new Set(previous).add(note));
    };
    const onKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (!heldKeyboardNotes.current.has(key)) return;
      const note = heldKeyboardNotes.current.get(key);
      heldKeyboardNotes.current.delete(key);
      engineRef.current?.noteOff(note);
      setActiveNotes((previous) => {
        const next = new Set(previous);
        next.delete(note);
        return next;
      });
    };
    const onBlur = () => {
      for (const note of heldKeyboardNotes.current.values()) engineRef.current?.noteOff(note);
      heldKeyboardNotes.current.clear();
      setActiveNotes(new Set());
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [octaveShift, playDemo]);

  const handleImport = useCallback(async (file) => {
    if (!file) return;
    try {
      const importedPatch = await parsePresetFile(file);
      importedPatch.masterVolume = volumeRef.current;
      const entry = {
        id: `import-${Date.now()}`,
        file: file.name,
        name: importedPatch.name,
        author: importedPatch.author,
        format: importedPatch.format,
        category: importedPatch.category,
        tint: importedPatch.tint,
        description: importedPatch.description,
        imported: true,
      };
      if (engineRef.current?.phraseActive) engineRef.current.stopPhrase();
      setPlayingDemoId(null);
      setPatch(importedPatch);
      setSelectedPreset(entry);
      engineRef.current?.setPatch(importedPatch);
      setSidebarOpen(false);
      notify(`Imported ${importedPatch.name} · ${importedPatch.format}`);
    } catch (error) {
      notify(error?.message || 'That preset could not be read.');
    }
  }, [notify]);

  const onFilePicker = (event) => {
    handleImport(event.target.files?.[0]);
    event.target.value = '';
  };

  const noteOn = (note) => {
    activateAudio();
    engineRef.current?.noteOn(note, 0.84);
    setActiveNotes((previous) => new Set(previous).add(note));
  };
  const noteOff = (note) => {
    engineRef.current?.noteOff(note);
    setActiveNotes((previous) => {
      const next = new Set(previous);
      next.delete(note);
      return next;
    });
  };

  const updateMacro = (index, value) => {
    setPatch((previous) => {
      if (!previous) return previous;
      const macros = [...previous.macros];
      macros[index] = { ...macros[index], value };
      return { ...previous, macros };
    });
    const cutoffFromMacro = (macroValue) => 260 * (11000 / 260) ** macroValue;
    if (index === 0) setParam('osc1.position', value);
    if (index === 1) {
      setParam('effects.reverb', value * 0.62);
      setParam('effects.delay', value * 0.34);
    }
    if (index === 2) setParam('filter.cutoffHz', cutoffFromMacro(value));
    if (index === 3) setParam('effects.distortion', value * 0.72);
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (event) => {
    event.preventDefault();
    if (event.currentTarget === event.target) setIsDragging(false);
  };
  const onDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleImport(event.dataTransfer.files?.[0]);
  };

  const keys = useMemo(() => {
    const start = 48 + octaveShift * 12;
    let whiteIndex = 0;
    return Array.from({ length: 25 }, (_, index) => {
      const midi = start + index;
      const pitch = index % 12;
      const black = BLACK_PITCHES.has(pitch);
      let position;
      if (black) position = whiteIndex;
      else {
        position = whiteIndex;
        whiteIndex += 1;
      }
      return { midi, pitch, black, position, octave: Math.floor(midi / 12) - 1 };
    });
  }, [octaveShift]);

  const currentDemo = playingDemoId ? DEMOS.find((demo) => demo.id === playingDemoId) : null;
  const engineStatusText = audioStatus === 'active' ? 'AUDIO ACTIVE' : audioStatus === 'starting' ? 'STARTING AUDIO' : audioStatus === 'error' ? 'AUDIO ERROR' : 'ENGINE STANDBY';

  return (
    <div className="app-shell" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><AudioLines size={20} strokeWidth={2.1} /></div>
          <div className="brand-wordmark"><strong>PHASEFORM</strong><span>WAVETABLE STUDIO</span></div>
        </div>
        <button className="mobile-menu-button" onClick={() => setSidebarOpen((open) => !open)} aria-label="Toggle preset library">
          {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
        <div className="topbar-center">
          <span className={`status-light status-${audioStatus}`} />
          <span>{engineStatusText}</span>
          <span className="topbar-divider">/</span>
          <span>44.1 KHZ</span>
          <span className="local-badge"><Activity size={11} /> LOCAL</span>
        </div>
        <div className="topbar-actions">
          <button className="top-icon-button" title="Keyboard shortcuts" onClick={() => notify('Use A W S E D F T G Y H U J K to play · Space previews a phrase.')}><CircleHelp size={16} /></button>
          <button className="upload-button" onClick={() => fileInputRef.current?.click()}><Upload size={14} /><span>Import preset</span></button>
          <div className="master-volume-control">
            <Volume2 size={15} />
            <input aria-label="Master volume" type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => { const value = Number(event.target.value); volumeRef.current = value; setVolume(value); setParam('masterVolume', value); }} />
            <span>{Math.round(volume * 100)}</span>
          </div>
          <button className={`power-button ${audioStatus === 'active' ? 'power-active' : ''}`} onClick={activateAudio} title="Enable audio">
            <Power size={15} /><span>{audioStatus === 'active' ? 'Ready' : audioStatus === 'starting' ? 'Starting' : 'Enable audio'}</span>
          </button>
        </div>
      </header>

      <div className={`app-body ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <aside className="sidebar">
          <div className="sidebar-topline">
            <div><span className="eyebrow">SOUND BROWSER</span><h2>Library <span>{PRESETS.length}</span></h2></div>
            <button className={`favorite-filter ${favoriteOnly ? 'filter-active' : ''}`} onClick={() => setFavoriteOnly((value) => !value)} title="Show favorites only"><Heart size={14} fill={favoriteOnly ? 'currentColor' : 'none'} /></button>
          </div>
          <div className="browser-switcher">
            <button className={!showDemos ? 'switch-active' : ''} onClick={() => setShowDemos(false)}><Disc3 size={13} /> Presets</button>
            <button className={showDemos ? 'switch-active' : ''} onClick={() => setShowDemos(true)}><ListMusic size={13} /> Demos <span className="switch-count">05</span></button>
          </div>

          {!showDemos ? (
            <>
              <label className="search-field"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a sound..." /><span className="search-shortcut">⌘ K</span></label>
              <div className="format-filter-row">
                {['ALL', 'SERUM', 'VITAL'].map((filter) => <button key={filter} className={formatFilter === filter ? 'format-selected' : ''} onClick={() => setFormatFilter(filter)}>{filter}</button>)}
              </div>
              <div className="category-filter-row">
                {FILTER_CATEGORIES.map((category) => <button key={category} className={categoryFilter === category ? 'category-selected' : ''} onClick={() => setCategoryFilter(category)}>{category}</button>)}
              </div>
              <div className="preset-list-heading"><span>PRESETS</span><span>{visiblePresets.length.toString().padStart(2, '0')} SOUNDS</span></div>
              <div className="preset-list">
                {visiblePresets.map((preset) => (
                  <PresetRow
                    key={preset.id}
                    preset={preset}
                    selected={selectedPreset?.id === preset.id}
                    favorite={favoriteIds.has(preset.id)}
                    loading={loadingPresetId === preset.id}
                    onSelect={() => loadPreset(preset)}
                    onFavorite={() => toggleFavorite(preset.id)}
                  />
                ))}
                {!visiblePresets.length && <div className="empty-library"><Search size={18} /><span>No sounds match that search.</span><button onClick={() => { setQuery(''); setCategoryFilter('ALL'); setFormatFilter('ALL'); setFavoriteOnly(false); }}>Clear filters</button></div>}
              </div>
              <div className="sidebar-footer"><span className="folder-icon"><Waves size={15} /></span><span><b>Preset formats</b><small>Vital · Serum 1 · Serum 2</small></span><ChevronDown size={13} /></div>
            </>
          ) : (
            <div className="demo-library">
              <div className="demo-intro"><span className="demo-intro-icon"><Music2 size={16} /></span><div><b>Play a phrase</b><small>Choose a patch and hear a short demo.</small></div></div>
              {DEMOS.map((demo) => <DemoRow key={demo.id} demo={demo} preset={getPresetById(demo.presetId)} active={playingDemoId === demo.id} onClick={() => loadAndPlayDemo(demo)} />)}
              <div className="demo-tip"><Zap size={14} /><span>Every note in the demo is played by the same live synth engine as the keyboard.</span></div>
            </div>
          )}

          <button className="sidebar-import" onClick={() => fileInputRef.current?.click()}><Upload size={14} /><span>Drop or browse preset files</span><span className="filetypes">.vital · .fxp · .SerumPreset</span></button>
        </aside>

        <main className="main-workspace">
          <div className="workspace-toolbar">
            <div className="breadcrumb"><span>INSTRUMENT</span><ChevronRight size={12} /><span>WAVETABLE SYNTH</span><span className="breadcrumb-dot" /><span className="unsaved-state">LIVE SESSION</span></div>
            <div className="workspace-toolbar-right"><span className="midi-status"><span /> QWERTY READY</span><button className="toolbar-gear" onClick={() => notify('Shortcuts: A–L plays notes · Space previews · change octaves with the keyboard arrows.')} aria-label="Help and shortcuts"><Settings2 size={15} /></button></div>
          </div>

          <div className="patch-heading">
            <div className="patch-title-block">
              <span className="eyebrow">CURRENT PATCH <span className="patch-id">/ {selectedPreset?.id?.slice(0, 5).toUpperCase() || '-----'}</span></span>
              <div className="patch-title-line"><h1>{patch?.name || 'Loading preset…'}</h1><span className={`format-pill ${formatClasses(patch?.format)}`}>{patch?.format || '—'}</span></div>
              <p className="patch-description">{patch?.description || 'Loading a wavetable patch for your browser.'} <span>·</span> <span className="patch-author">{patch?.author || ' '}</span></p>
            </div>
            <div className="patch-actions">
              <button className={`round-action ${favoriteIds.has(selectedPreset?.id) ? 'favorite-on' : ''}`} onClick={() => selectedPreset && toggleFavorite(selectedPreset.id)} title="Favorite this patch"><Heart size={16} fill={favoriteIds.has(selectedPreset?.id) ? 'currentColor' : 'none'} /></button>
              <button className={`preview-button ${playingDemoId ? 'preview-playing' : ''}`} onClick={() => playDemo()}>
                {playingDemoId ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                <span>{playingDemoId ? 'Stop phrase' : 'Hear a phrase'}</span>
                <span className="space-key">SPACE</span>
              </button>
            </div>
          </div>

          <div className="studio-layout">
            <div className="control-column">
              <section className="panel oscillator-panel">
                <div className="panel-heading">
                  <div className="panel-title"><span className="panel-index">01</span><div><h3>Oscillator bank</h3><p>Two voices · live wavetable scan</p></div></div>
                  <div className="signal-indicator"><span /> SIGNAL FLOW</div>
                </div>
                {patch ? (
                  <div className="oscillator-grid">
                    <OscillatorCard letter="A" oscillator={patch.osc1} patchTint={patch.tint} onParam={setParam} toggle={setParam} />
                    <OscillatorCard letter="B" oscillator={patch.osc2} patchTint={patch.tint} onParam={setParam} toggle={setParam} />
                  </div>
                ) : <div className="panel-loading"><LoaderCircle size={17} /> Preparing the wavetable…</div>}
              </section>

              <div className="lower-panels">
                <section className="panel compact-panel filter-panel">
                  <div className="compact-panel-heading"><span className="panel-index">02</span><div><h3>Filter</h3><p>LP 24 · analog model</p></div><button className={`tiny-toggle ${patch?.filter.enabled ? 'is-on' : ''}`} onClick={() => patch && setParam('filter.enabled', !patch.filter.enabled)} aria-label="Toggle filter" aria-pressed={Boolean(patch?.filter.enabled)}><span /></button></div>
                  {patch && <div className="dial-pair">
                    <Knob label="CUTOFF" value={patch.filter.cutoffHz} min={80} max={18000} step={1} onChange={(value) => setParam('filter.cutoffHz', value)} displayValue={displayHz(patch.filter.cutoffHz)} size="small" color={patch.tint} />
                    <Knob label="RESONANCE" value={patch.filter.resonance} min={0} max={0.9} step={0.01} onChange={(value) => setParam('filter.resonance', value)} displayValue={`${Math.round(patch.filter.resonance * 100)}%`} size="small" color={patch.tint} />
                  </div>}
                </section>

                <section className="panel compact-panel envelope-panel">
                  <div className="compact-panel-heading"><span className="panel-index">03</span><div><h3>Amp envelope</h3><p>ADSR · voice amplitude</p></div><span className="env-status"><span /> ACTIVE</span></div>
                  {patch && <div className="envelope-content">
                    <div className="envelope-graphic"><svg viewBox="0 0 212 54" role="img" aria-label="Amplitude envelope"><path className="env-grid" d="M0 43.5H212M0 27H212M0 10.5H212" /><path className="env-path" d={`M4 45 L${16 + Math.min(46, patch.env.attack * 25)} 6 L${65 + Math.min(40, patch.env.decay * 18)} ${42 - patch.env.sustain * 29} L160 ${42 - patch.env.sustain * 29} L208 45`} /></svg></div>
                    <div className="env-knobs">
                      <Knob label="ATK" value={patch.env.attack} min={0.003} max={2.5} step={0.005} onChange={(value) => setParam('env.attack', value)} displayValue={`${Math.round(patch.env.attack * 1000)}ms`} size="tiny" color={patch.tint} />
                      <Knob label="DEC" value={patch.env.decay} min={0.03} max={3.5} step={0.01} onChange={(value) => setParam('env.decay', value)} displayValue={`${patch.env.decay.toFixed(1)}s`} size="tiny" color={patch.tint} />
                      <Knob label="SUS" value={patch.env.sustain} min={0} max={1} step={0.01} onChange={(value) => setParam('env.sustain', value)} displayValue={`${Math.round(patch.env.sustain * 100)}%`} size="tiny" color={patch.tint} />
                      <Knob label="REL" value={patch.env.release} min={0.025} max={3} step={0.01} onChange={(value) => setParam('env.release', value)} displayValue={`${patch.env.release.toFixed(1)}s`} size="tiny" color={patch.tint} />
                    </div>
                  </div>}
                </section>

                <section className="panel compact-panel fx-panel">
                  <div className="compact-panel-heading"><span className="panel-index">04</span><div><h3>Space &amp; color</h3><p>Global effects</p></div><Sparkles size={14} className="fx-heading-icon" /></div>
                  {patch && <div className="fx-control-list">
                    <InlineSlider label="REVERB" value={patch.effects.reverb} onChange={(value) => setParam('effects.reverb', value)} tint={patch.tint} />
                    <InlineSlider label="DELAY" value={patch.effects.delay} onChange={(value) => setParam('effects.delay', value)} tint="blue" />
                    <InlineSlider label="DRIVE" value={patch.effects.distortion} onChange={(value) => setParam('effects.distortion', value)} tint="amber" />
                  </div>}
                </section>
              </div>
            </div>

            <aside className="performance-column">
              <section className="panel macro-panel">
                <div className="panel-heading macro-heading">
                  <div className="panel-title"><span className="panel-index">05</span><div><h3>Performance</h3><p>Four macro controls</p></div></div>
                  <SlidersHorizontal size={15} className="macro-heading-icon" />
                </div>
                <div className="macro-grid">
                  {(patch?.macros || []).map((macro, index) => (
                    <Knob
                      key={`${selectedPreset?.id}-${index}`}
                      label={macro.name}
                      value={macro.value}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(value) => updateMacro(index, value)}
                      displayValue={`${Math.round(macro.value * 100)}%`}
                      color={index === 0 ? patch?.tint : index === 1 ? 'blue' : index === 2 ? 'mint' : 'amber'}
                    />
                  ))}
                </div>
                <div className="macro-footer"><span><span className="macro-light" /> LIVE MAPPING</span><button onClick={() => notify('Macros map to wavetable position, space, filter tone and drive.')}>HOW IT WORKS <ChevronRight size={11} /></button></div>
              </section>

              <section className="panel output-panel">
                <div className="output-topline"><span className="eyebrow">OUTPUT</span><span className="output-readout">STEREO <span>·</span> 24 VOICES</span></div>
                <div className={`output-meter ${audioStatus === 'active' ? 'meter-active' : ''}`} aria-hidden="true">
                  {Array.from({ length: 28 }, (_, index) => <span key={index} style={{ '--bar': index }} />)}
                </div>
                <div className="output-bottom"><span><Volume2 size={12} /> MASTER</span><b>{Math.round(volume * 100)}%</b></div>
              </section>

              <section className="engine-note-card">
                <div className="engine-note-icon"><Waves size={16} /></div>
                <div><span className="eyebrow">PLAYBACK ENGINE</span><p>{patch?.engineNote || 'AudioWorklet · low-latency synthesis'}</p></div>
              </section>
            </aside>
          </div>

          <section className="keyboard-dock">
            <div className="keyboard-toolbar">
              <div className="keyboard-title"><span className="keyboard-icon"><Keyboard size={15} /></span><div><b>Performance keyboard</b><small>Click and hold a key, or use your computer keyboard</small></div></div>
              <div className="keyboard-controls">
                <span className="keyboard-map-label"><span>A</span> W S E D F T G Y H U J K</span>
                <div className="octave-control"><span>OCTAVE</span><button onClick={() => setOctaveShift((value) => Math.max(-2, value - 1))} aria-label="Lower octave"><ChevronLeft size={13} /></button><b>{octaveShift > 0 ? `+${octaveShift}` : octaveShift}</b><button onClick={() => setOctaveShift((value) => Math.min(2, value + 1))} aria-label="Raise octave"><ChevronRight size={13} /></button></div>
              </div>
            </div>
            <div className="keybed" role="group" aria-label="Two-octave performance keyboard">
              {keys.filter((key) => !key.black).map((key) => {
                const whitePosition = key.position;
                const hotkey = Object.entries(KEYBOARD_MAP).find(([, offset]) => key.midi === 60 + octaveShift * 12 + offset)?.[0];
                const pitchNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
                return (
                  <button
                    key={key.midi}
                    className={`piano-key white-key ${activeNotes.has(key.midi) ? 'key-active' : ''}`}
                    style={{ '--white-index': whitePosition }}
                    onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); noteOn(key.midi); }}
                    onPointerUp={() => noteOff(key.midi)}
                    onPointerCancel={() => noteOff(key.midi)}
                    onLostPointerCapture={() => noteOff(key.midi)}
                    aria-label={`${pitchNames[key.midi % 12]}${key.octave}`}
                  >
                    <span className="key-note-label">{key.pitch === 0 || key.pitch === 5 ? `${pitchNames[key.pitch]}${key.octave}` : ''}</span>
                    {hotkey && <span className="key-hotkey">{hotkey.toUpperCase()}</span>}
                  </button>
                );
              })}
              {keys.filter((key) => key.black).map((key) => {
                const hotkey = Object.entries(KEYBOARD_MAP).find(([, offset]) => key.midi === 60 + octaveShift * 12 + offset)?.[0];
                const pitchNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
                return (
                  <button
                    key={key.midi}
                    className={`piano-key black-key ${activeNotes.has(key.midi) ? 'key-active' : ''}`}
                    style={{ '--black-boundary': key.position }}
                    onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); noteOn(key.midi); }}
                    onPointerUp={() => noteOff(key.midi)}
                    onPointerCancel={() => noteOff(key.midi)}
                    onLostPointerCapture={() => noteOff(key.midi)}
                    aria-label={`${pitchNames[key.midi % 12]}${key.octave}`}
                  >
                    {hotkey && <span className="key-hotkey black-hotkey">{hotkey.toUpperCase()}</span>}
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      <input ref={fileInputRef} className="hidden-file-input" type="file" accept=".vital,.fxp,.SerumPreset,.serumpreset" onChange={onFilePicker} />
      {isDragging && <div className="drop-overlay"><div><Upload size={25} /><strong>Drop your preset to load it</strong><span>Vital · Serum 1 FXP · Serum 2 preset</span></div></div>}
      {toast && <div className="toast-message"><span><Check size={14} /></span>{toast}</div>}
      {currentDemo && <div className="playing-pill"><span className="playing-equalizer"><i /><i /><i /></span><span>PLAYING</span><b>{currentDemo.title}</b><button onClick={() => { engineRef.current?.stopPhrase(); setPlayingDemoId(null); }} aria-label="Stop demo"><X size={13} /></button></div>}
      <div className="sr-only">{audioStatus === 'active' ? 'Audio engine active' : audioStatus === 'starting' ? 'Starting audio engine' : 'Audio engine not started'}</div>
    </div>
  );
}

export default App;
