// module/tonejs/player.js
/*未開発です*/


// dev-module/tonejs/player.js

import { Midi } from 'https://unpkg.com/@tonejs/midi'; // CDNから直接インポートするか、バンドラーで解決
import * as Tone from 'https://unpkg.com/tone@14.7.77/build/Tone.js'; // CDNから直接インポートするか、バンドラーで解決

export class TonePlayer {
    /** @private */
    #synth = null;
    /** @private */
    #currentPart = null; // 再生中のTone.Partインスタンス

    constructor() {
        // シンセサイザーの初期化は一度だけ行う
        this.#synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: "sine" // 必要に応じて音色を変更
            }
        }).toDestination();
        console.log("Tone.js Synth initialized!");
    }

    /**
     * MIDI ArrayBufferを解析し、音楽を再生します。
     * @param {ArrayBuffer} midiBuffer - CoreProcessorから取得したMIDIデータ
     * @returns {Promise<void>}
     */
    async playMidi(midiBuffer) {
        if (!this.#synth) {
            console.error("Tone.js Synth is not initialized.");
            return;
        }

        // 既に再生中のパートがあれば停止・破棄する
        this.stop();

        try {
            // Web Audio APIはユーザーのインタラクションがないと開始できないため、ここで開始を試みる
            await Tone.start();
            console.log("Web Audio Context started.");

            const midi = new Midi(midiBuffer);

            // MIDIトラックをTone.jsのPartに変換して再生
            midi.tracks.forEach(track => {
                // `start(0)` で即時開始
                this.#currentPart = new Tone.Part((time, note) => {
                    this.#synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
                }, track.notes).start(0);
            });

            Tone.Transport.start(); // Tone.Transportを開始してシーケンスを再生
            console.log("MIDI playback started.");

            // 再生終了を検知したい場合 (例: Tone.Transport.on("stop", ...) を使う)
            // この例ではシンプルに再生開始のみ
        } catch (e) {
            console.error("Error parsing or playing MIDI:", e);
            alert("Failed to play MIDI. Please ensure the selected range contains valid notes.");
            this.stop(); // エラー時は停止状態に戻す
        }
    }

    /**
     * 現在再生中の音楽を停止します。
     */
    stop() {
        if (this.#currentPart) {
            this.#currentPart.stop();
            this.#currentPart.dispose();
            this.#currentPart = null;
        }
        Tone.Transport.stop();
        Tone.Transport.cancel(); // スケジュールされたイベントをクリア
        console.log("MIDI playback stopped.");
    }
}


/*

// main.js (またはアプリケーションの起動スクリプト)

import { VerovioManager } from './dev-module/verovio/verovio-manager.min.js'; // minifiedを使う場合
import { TonePlayer } from './dev-module/audio/tone-player.min.js'; // 新しいTonePlayerモジュール

document.addEventListener("DOMContentLoaded", async () => {
    const verovioManager = new VerovioManager();
    const tonePlayer = new TonePlayer(); // TonePlayerのインスタンス

    const notationElement = document.getElementById("notation");
    const startMeasureInput = document.getElementById("startMeasure");
    const endMeasureInput = document.getElementById("endMeasure");
    const applySelectionButton = document.getElementById("applySelection");
    const clearSelectionButton = document.getElementById("clearSelection");
    const playMusicButton = document.getElementById("playMusic");
    const stopMusicButton = document.getElementById("stopMusic"); // 停止ボタンも追加

    const meiUrl = "https://cdn.jsdelivr.net/gh/kogu0507/module@v2.3.0/examples/sample.mei";
    const targetId = "notation"; // displaySvgがIDを受け取るため

    try {
        // VerovioManagerの初期化
        await verovioManager.initialize();

        // 初期オプション設定
        verovioManager.setRenderOptions({
            pageWidth: document.body.clientWidth * 0.9,
            pageHeight: 600,
            scale: 60,
            scaleToPageSize: true,
        });

        // MEIデータの初期ロードと表示（全範囲）
        await verovioManager.loadAndDisplayMei(meiUrl, targetId);
        console.log("MEI data loaded and initial SVG displayed via VerovioManager.");

        // --- イベントリスナーの設定 ---

        applySelectionButton.addEventListener("click", async () => {
            const start = startMeasureInput.value;
            const end = endMeasureInput.value;
            try {
                await verovioManager.displayMeasureRangeOnElement(start, end, targetId);
                tonePlayer.stop(); // 範囲が変更されたら再生を停止
            } catch (error) {
                console.error("Failed to apply selection:", error);
                // エラー表示はScoreUIHandlerが行うのでここでは不要
            }
        });

        clearSelectionButton.addEventListener("click", async () => {
            startMeasureInput.value = "start";
            endMeasureInput.value = "end";
            try {
                // 全範囲表示
                await verovioManager.displayMeasureRangeOnElement("start", "end", targetId);
                tonePlayer.stop(); // 範囲が変更されたら再生を停止
            } catch (error) {
                console.error("Failed to clear selection:", error);
            }
        });

        playMusicButton.addEventListener("click", async () => {
            // 現在の選択範囲のMIDIデータを取得して再生
            const start = startMeasureInput.value;
            const end = endMeasureInput.value;
            try {
                const midiBuffer = await verovioManager.getMidiForMeasureRange(start, end);
                await tonePlayer.playMidi(midiBuffer); // TonePlayerで再生
            } catch (error) {
                console.error("Failed to play music:", error);
                alert("音楽の再生に失敗しました: " + error.message);
            }
        });

        stopMusicButton.addEventListener("click", () => {
            tonePlayer.stop();
        });

    } catch (error) {
        console.error("Application initialization failed:", error);
        notationElement.innerHTML = `<p style="color: red;">アプリケーションの初期化に失敗しました: ${error.message}</p>`;
    }
});

*/