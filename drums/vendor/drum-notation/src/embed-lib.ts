import "./obsidian-dom";
import "../../styles.css";

import { renderVexflowScore } from "../../src/engrave";
import { parseDrumBlockWithWarnings } from "../../src/parser";
import { DrumPlayer } from "../../src/player";
import { recoverAudioContext } from "../../src/playback";
import { createSynthPlaybackBackend } from "../../src/synth";
import type { DrumBlock } from "../../src/types";

export interface DrumNotationHandle {
  setSource(source: string): void;
  stop(): void;
  destroy(): void;
}

function ensureShell(host: HTMLElement): {
  playBtn: HTMLButtonElement;
  stopBtn: HTMLButtonElement;
  loopBtn: HTMLButtonElement;
  statusEl: HTMLSpanElement;
  preview: HTMLDivElement;
} {
  host.classList.add("drum-notation-host");
  host.innerHTML = `
    <div class="embed">
      <div class="embed-toolbar">
        <button type="button" class="primary" data-act="play">Play</button>
        <button type="button" data-act="stop">Stop</button>
        <button type="button" data-act="loop">Loop</button>
        <span class="embed-status" data-act="status">Ready</span>
      </div>
      <div class="embed-preview drum-notation" data-act="preview"></div>
      <div class="embed-credit">
        Notation engine:
        <a href="https://github.com/vkamolov/obsidian-drum-notation" target="_blank" rel="noopener">obsidian-drum-notation</a>
        (MIT)
      </div>
    </div>
  `;
  return {
    playBtn: host.querySelector('[data-act="play"]') as HTMLButtonElement,
    stopBtn: host.querySelector('[data-act="stop"]') as HTMLButtonElement,
    loopBtn: host.querySelector('[data-act="loop"]') as HTMLButtonElement,
    statusEl: host.querySelector('[data-act="status"]') as HTMLSpanElement,
    preview: host.querySelector('[data-act="preview"]') as HTMLDivElement
  };
}

export function mount(host: HTMLElement): DrumNotationHandle {
  const ui = ensureShell(host);
  let currentSource = "";
  let currentBlock: DrumBlock | null = null;
  let player: DrumPlayer | null = null;
  let audioContext: AudioContext | null = null;
  let loopMode = false;
  let destroyed = false;

  function setStatus(text: string): void {
    ui.statusEl.textContent = text;
  }

  function stopPlayback(): void {
    if (player) {
      player.stop();
      player = null;
    }
  }

  async function ensureAudio(): Promise<AudioContext> {
    await recoverAudioContext({
      get: () => audioContext,
      set: (context) => {
        audioContext = context;
      },
      create: () => new AudioContext()
    });
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
    return audioContext;
  }

  function renderNotation(source: string): void {
    if (destroyed) return;
    currentSource = source.trim();
    stopPlayback();
    ui.preview.replaceChildren();
    ui.preview.classList.remove("drum-notation--legend-color");

    if (!currentSource) {
      currentBlock = null;
      ui.playBtn.disabled = true;
      ui.stopBtn.disabled = true;
      ui.loopBtn.disabled = true;
      ui.preview.innerHTML = `<div class="embed-empty">Add a drums pattern above to preview.</div>`;
      setStatus("Empty");
      return;
    }

    try {
      const parsed = parseDrumBlockWithWarnings(currentSource);
      currentBlock = parsed.block;
      const hasRows = currentBlock.rows.length > 0;
      ui.playBtn.disabled = !hasRows;
      ui.stopBtn.disabled = !hasRows;
      ui.loopBtn.disabled = !hasRows;

      if (!hasRows) {
        ui.preview.innerHTML = `<div class="embed-empty">No supported drum rows yet (HH / SD / BD…).</div>`;
        setStatus(parsed.warnings[0]?.message || "No rows");
        return;
      }

      if (currentBlock.legendMode !== "off") {
        ui.preview.classList.add("drum-notation--legend-color");
      }

      const viewport = document.createElement("div");
      viewport.className = "drum-notation__score-viewport";
      const score = document.createElement("div");
      score.className = "drum-notation__score";
      viewport.appendChild(score);
      ui.preview.appendChild(viewport);
      renderVexflowScore(currentBlock, score);

      const warn = parsed.warnings[0]?.message;
      setStatus(warn ? `⚠ ${warn}` : `${currentBlock.tempo} BPM · ${currentBlock.timeSignature}`);
    } catch (error) {
      currentBlock = null;
      ui.playBtn.disabled = true;
      ui.stopBtn.disabled = true;
      ui.loopBtn.disabled = true;
      const message = error instanceof Error ? error.message : String(error);
      ui.preview.innerHTML = `<pre class="embed-error">${message}</pre>`;
      setStatus("Parse error");
    }
  }

  async function startPlayback(loop: boolean): Promise<void> {
    if (!currentBlock || currentBlock.slots.length === 0) return;
    stopPlayback();
    loopMode = loop;
    const ctx = await ensureAudio();
    player = new DrumPlayer(
      ctx,
      currentBlock,
      () => {
        player = null;
        setStatus(loopMode ? "Loop ended" : "Stopped");
      },
      () => {
        /* optional slot highlight */
      },
      {
        loop: loopMode,
        speedPercent: 100,
        metronomeMode: "off",
        countInMode: "off"
      },
      createSynthPlaybackBackend
    );
    setStatus(loopMode ? "Looping…" : "Playing…");
    await player.play();
  }

  ui.playBtn.addEventListener("click", () => {
    void startPlayback(false);
  });
  ui.stopBtn.addEventListener("click", () => {
    stopPlayback();
    setStatus("Stopped");
  });
  ui.loopBtn.addEventListener("click", () => {
    void startPlayback(true);
  });

  renderNotation("");

  return {
    setSource(source: string) {
      renderNotation(source);
    },
    stop() {
      stopPlayback();
    },
    destroy() {
      destroyed = true;
      stopPlayback();
      host.replaceChildren();
    }
  };
}

declare global {
  interface Window {
    DrumNotationEmbed?: { mount: typeof mount };
  }
}

window.DrumNotationEmbed = { mount };
