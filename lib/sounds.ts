// Synthesised card sounds via Web Audio API — no audio files needed

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// Warm up the AudioContext on the first user gesture so sounds are ready
if (typeof window !== "undefined") {
  const init = () => {
    getCtx();
    window.removeEventListener("pointerdown", init);
  };
  window.addEventListener("pointerdown", init, { once: true });
}

/** Short whoosh + soft thump — played when a card slides onto the table */
export function playCardDeal(delayMs = 0) {
  try {
    const ac = getCtx();
    if (!ac) return;

    const t = ac.currentTime + delayMs / 1000;

    // ── Whoosh: filtered white noise that decays quickly ──
    const len = Math.floor(ac.sampleRate * 0.055);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.8);
    }
    const whoosh = ac.createBufferSource();
    whoosh.buffer = buf;

    const hpf = ac.createBiquadFilter();
    hpf.type = "highpass";
    hpf.frequency.value = 1800;

    const wg = ac.createGain();
    wg.gain.setValueAtTime(0.22, t);
    wg.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

    whoosh.connect(hpf);
    hpf.connect(wg);
    wg.connect(ac.destination);
    whoosh.start(t);

    // ── Thump: pitched sine that drops fast, card landing on felt ──
    const tl = t + 0.03;
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(170, tl);
    osc.frequency.exponentialRampToValueAtTime(55, tl + 0.05);

    const og = ac.createGain();
    og.gain.setValueAtTime(0.28, tl);
    og.gain.exponentialRampToValueAtTime(0.001, tl + 0.07);

    osc.connect(og);
    og.connect(ac.destination);
    osc.start(tl);
    osc.stop(tl + 0.07);
  } catch {
    // Silently ignore if audio is unavailable
  }
}

/** Quick paper-flick — played when the dealer's hole card flips over */
export function playCardFlip() {
  try {
    const ac = getCtx();
    if (!ac) return;

    const t = ac.currentTime;
    const len = Math.floor(ac.sampleRate * 0.07);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      // Bell-shaped envelope — louder in the middle
      const env = Math.sin((Math.PI * i) / len);
      d[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ac.createBufferSource();
    src.buffer = buf;

    const bpf = ac.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.value = 3500;
    bpf.Q.value = 0.7;

    const fg = ac.createGain();
    fg.gain.setValueAtTime(0.14, t);

    src.connect(bpf);
    bpf.connect(fg);
    fg.connect(ac.destination);
    src.start(t);
  } catch {
    // Silently ignore
  }
}
