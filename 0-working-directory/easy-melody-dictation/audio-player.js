// audio-player.js
import { loadToneJs } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@v2.9.0/tonejs/loader.min.mjs';
import { loadToneJsMidi } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@v2.9.0/tonejs/tonejs-midi-loader.min.mjs';
//import * as Tone from 'tone';


console.log("[ezmelo] audio-player module loaded");

// モジュールスコープ変数に格納
let MidiClass = null;

/**
 * Tone.js と @tonejs/midi をロードして MidiClass をセット
 */
export async function setupAudio() {
  await loadToneJs();
  console.log("[ezmelo] Tone.js loaded");
  MidiClass = await loadToneJsMidi();
  console.log("[ezmelo] Midiクラス取得:", MidiClass);
}


/** ───────────────────────────────
 *  音源管理（将来サンプラー等を追加）
 *  ─────────────────────────────── */
export class Instruments {
  constructor() {
    console.log("[ezmelo] Instruments: init");
    // 例：Salamander ピアノサンプラーを準備
    this.sampler = new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        D4: "D4.mp3",
        E4: "E4.mp3",
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => console.log("[ezmelo] Sampler loaded"),
    }).toDestination();
  }
}

/** ───────────────────────────────
 *  ボリューム管理（Tone.js Volume ノード）
 *  ─────────────────────────────── */
export class Volume {
  constructor(initialDb = 0) {
    this.node = new Tone.Volume(initialDb).toDestination();
    console.log("[ezmelo] Volume: init", initialDb);
  }
  set(db) {
    this.node.volume.value = db;
    console.log("[ezmelo] Volume: set", db);
  }
}

/** ───────────────────────────────
 *  再生の基底クラス
 *  ─────────────────────────────── */
export class AudioPlayerBase {
  constructor() {
    console.log("[ezmelo] AudioPlayerBase: constructor");
    // Tone.js を使うのでここでは何もしません
  }
  play() { console.log("[ezmelo] AudioPlayerBase: play"); }
  stop() { console.log("[ezmelo] AudioPlayerBase: stop"); }
  setVolume(v) { console.log("[ezmelo] AudioPlayerBase: setVolume", v); }
  mute() { console.log("[ezmelo] AudioPlayerBase: mute"); }
  unmute() { console.log("[ezmelo] AudioPlayerBase: unmute"); }
}

/** ───────────────────────────────
 *  メロディ暗譜用プレイヤー
 *  ─────────────────────────────── */
export class DictationPlayer extends AudioPlayerBase {
  constructor() {
    super();
    console.log("[ezmelo] DictationPlayer: ready");
    // 単純なシンセを準備
    this.synth = new Tone.Synth().toDestination();
  }

  /**
   * noteData: ArrayBuffer の MIDI データ
   */
  async playNotes(noteData) {
    console.log("[ezmelo] DictationPlayer: playNotes", noteData);

    await setupAudio();
    // ユーザー操作によるコンテキスト起動
    await Tone.start();

    if (!MidiClass) {
      console.error("[ezmelo] MidiClass がロードされていません！");
      return;
    }
    // MIDI バイナリを解析
    const midi = new Midi(noteData);

    // 各ノートをスケジュール
    midi.tracks.forEach(track => {
      track.notes.forEach(n => {
        // n.time は 0 からの相対秒
        this.synth.triggerAttackRelease(
          n.name,
          n.duration,
          Tone.now() + n.time
        );
      });
    });

    // Transport を使わないので start/stop 不要
  }

  stop() {
    console.log("[ezmelo] DictationPlayer: stop");
    // 手動でノートを消音
    this.synth.releaseAll?.();
  }
}

/** ───────────────────────────────
 *  終了ベル用プレイヤー
 *  ─────────────────────────────── */
export class BellPlayer extends AudioPlayerBase {
  constructor() {
    super();
    console.log("[ezmelo] BellPlayer: ready");
    // メタルシンセでベルっぽく鳴らす例
    this.bellSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 1, release: 0.5 }
    }).toDestination();
  }

  /**
   * bellId: 'endBell1' など
   */
  async playBell(bellId) {
    console.log("[ezmelo] BellPlayer: playBell", bellId);
    await Tone.start();
    // 必要なら bellId→ピッチをマッピング
    const pitch = bellId === "endBell1" ? "C6" : "C5";
    this.bellSynth.triggerAttackRelease(pitch, "1n", Tone.now());
  }
}

/** ───────────────────────────────
 *  プレイリスト連続再生（オプション）
 *  ─────────────────────────────── */
export class DictationPlaylistPlayer {
  constructor(players = []) {
    console.log("[ezmelo] DictationPlaylistPlayer: constructor", players);
    this.players = players;
    this.currentIndex = 0;
  }
  async playAll() {
    console.log("[ezmelo] DictationPlaylistPlayer: playAll start");
    for (const p of this.players) {
      if (p.playNotes) {
        await p.playNotes(); // or p.play()
      }
    }
  }
  stop() {
    console.log("[ezmelo] DictationPlaylistPlayer: stop");
    this.players.forEach(p => p.stop());
  }
}
