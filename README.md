# Phaseform — Wavetable Studio

A browser-based wavetable synthesizer built with React, Web Audio, and an `AudioWorklet`. It includes the preset files bundled in this repository, an on-screen two-octave keyboard, QWERTY note entry, editable oscillator/filter/envelope/effect controls, and short demo phrases.

## Run it

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev
```

For a production build, run `npm run build`; `npm run preview` serves that build locally.

## Presets

Use **Import preset** or drag a file into the app. The browser accepts:

- **Vital** `.vital` — reads oscillator settings and embedded wavetable frames.
- **Serum 2** `.SerumPreset` — reads the preset header and maps the available core oscillator, envelope, filter, and effect values.
- **Serum 1** `.fxp` — detects the VST preset and maps it to a playable browser patch.

The synth is a lightweight browser emulation, not the Serum or Vital plugin itself. Plugin-specific modulation, effects, and some preset data may sound different; the app keeps playback local and does not require either desktop plugin.

## Playing

- Click and hold the on-screen keys, or use **A W S E D F T G Y H U J K**.
- Use the octave arrows to transpose the keyboard.
- Click **Hear a phrase** (or press Space) for a short demo; choose another phrase in the Demos tab.
- Edit wavetable position, oscillator levels, filter, amp envelope, effects, and macro controls while playing.
