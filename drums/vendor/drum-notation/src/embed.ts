import "./obsidian-dom";
import "../../styles.css";

import { renderVexflowScore } from "../../src/engrave";
import { parseDrumBlockWithWarnings } from "../../src/parser";
import { DrumPlayer } from "../../src/player";
import { recoverAudioContext } from "../../src/playback";
import { createSynthPlaybackBackend } from "../../src/synth";
import type { DrumBlock } from "../../src/types";

const preview = document.getElementById("preview") as HTMLDivElement;
const statusEl = document.getElementById("status") as HTMLSpanElement;
const playBtn = document.getElementById("play") as HTMLButtonElement;
const stopBtn = document.getElementById("stop") as HTMLButtonElement;
const loopBtn = document.getElementById("loop") as HTMLButtonElement;

let currentSource = "";
let currentBlock: DrumBlock | null = null;
let player: DrumPlayer | null = null;
let audioContext: AudioContext | null = null;
let loopMode = false;

function postHeight(): void {
  const height = Math.ceil(document.body.scrollHeight);
  parent.postMessage({ type: "drums-embed-height", height }, "*");
}

function setStatus(text: string): void {
  statusEl.textContent = text;
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
  currentSource = source.trim();
  stopPlayback();
  preview.replaceChildren();
  preview.classList.remove("drum-notation--legend-color");

  if (!currentSource) {
    currentBlock = null;
    playBtn.disabled = true;
    stopBtn.disabled = true;
    loopBtn.disabled = true;
    preview.innerHTML = `<div class="embed-empty">Add a <code>drums</code> pattern above to preview.</div>`;
    setStatus("Empty");
    postHeight();
    return;
  }

  try {
    const parsed = parseDrumBlockWithWarnings(currentSource);
    currentBlock = parsed.block;
    const hasRows = currentBlock.rows.length > 0;
    playBtn.disabled = !hasRows;
    stopBtn.disabled = !hasRows;
    loopBtn.disabled = !hasRows;

    if (!hasRows) {
      preview.innerHTML = `<div class="embed-empty">No supported drum rows yet (HH / SD / BD…).</div>`;
      setStatus(parsed.warnings[0]?.message || "No rows");
      postHeight();
      return;
    }

    if (currentBlock.legendMode !== "off") {
      preview.classList.add("drum-notation--legend-color");
    }

    const viewport = document.createElement("div");
    viewport.className = "drum-notation__score-viewport";
    const score = document.createElement("div");
    score.className = "drum-notation__score";
    viewport.appendChild(score);
    preview.appendChild(viewport);
    renderVexflowScore(currentBlock, score);

    const warn = parsed.warnings[0]?.message;
    setStatus(warn ? `⚠ ${warn}` : `${currentBlock.tempo} BPM · ${currentBlock.timeSignature}`);
  } catch (error) {
    currentBlock = null;
    playBtn.disabled = true;
    stopBtn.disabled = true;
    loopBtn.disabled = true;
    const message = error instanceof Error ? error.message : String(error);
    preview.innerHTML = `<pre class="embed-error">${message}</pre>`;
    setStatus("Parse error");
  }

  requestAnimationFrame(postHeight);
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
      /* slot highlight optional in embed */
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

playBtn.addEventListener("click", () => {
  void startPlayback(false);
});
stopBtn.addEventListener("click", () => {
  stopPlayback();
  setStatus("Stopped");
});
loopBtn.addEventListener("click", () => {
  void startPlayback(true);
});

window.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;
  if (data.type === "drums-set" && typeof data.source === "string") {
    renderNotation(data.source);
  }
  if (data.type === "drums-stop") {
    stopPlayback();
    setStatus("Stopped");
  }
});

// Ready handshake for parent
parent.postMessage({ type: "drums-embed-ready" }, "*");
renderNotation("");
window.addEventListener("resize", postHeight);
