// app.js
import {
    setupVerovioManager,
    setVerovioRenderOptions,
    loadAndDisplayScore,
    getPlayableScoreDataFromMei,
} from "./verovio.js";
import { setupAudio, DictationPlayer, BellPlayer } from "./audio-player.js";



export class EasyMelodyDictationApp {
    constructor() {
        // ----- インスタンスプロパティ -----
        this.dictPlayer = null;
        this.bellPlayer = null;
        this.currentExercise = null;
        this.exercises = [];
        this.verOptions = {
            svgViewBox: true,
            adjustPageHeight: true,
            pageWidth: 2100,
            breaks: "encoded",
            spacingStaff: 5,
            spacingSystem: 15,
            footer: "none",
            pageMarginTop: 0,
            pageMarginRight: 10,
            pageMarginBottom: 0,
            pageMarginLeft: 10,
            minLastJustification: 0,
        };

        this.startBtn = document.querySelector('[data-role="start-playlist"]');
        this.stopBtn = document.querySelector('[data-role="stop"]');
        // あとは this.startBtn.addEventListener... で使い回し


        // メソッドの this バインド（必要なら）
        this.onStartClick = this.onStartClick.bind(this);
        this.onStopClick = this.onStopClick.bind(this);


    }

    async init() {
        console.log("[ezmelo] App.init start");
        await setupAudio();

        this.loadExercises();
        this.renderExerciseButtons();
        await this.setupVerovio();
        this.disableTabs();
        this.setupPlayers();
        this.setupPlayerEventListeners();
        console.log("[ezmelo] App.init done");
    }


    loadExercises() {
        const jsonEl = document.getElementById("ezmelo-json-data");
        this.exercises = JSON.parse(jsonEl.textContent.trim());
        console.log("[ezmelo] exercises loaded:", this.exercises);
    }

    renderExerciseButtons() {
        const selSec = document.querySelector(".ezmelo-exercise-selection-section");
        selSec.innerHTML = "";
        this.exercises.forEach(ex => {
            const btn = document.createElement("button");
            btn.textContent = `${ex.id}：${ex.exerciseInfo}`;
            btn.addEventListener("click", () => this.onSelectExercise(ex));
            selSec.appendChild(btn);
        });
    }

    async setupVerovio() {
        await setupVerovioManager();
        setVerovioRenderOptions(this.verOptions);
    }

    disableTabs() {
        const tabs = [
            document.querySelector('.tab-button[data-tab="exercise"]'),
            document.querySelector('.tab-button[data-tab="answer"]'),
        ];
        tabs.forEach(el => el && (el.disabled = true, el.classList.add("is-disabled")));
    }

    enableTabs() {
        /* TODO: */
    }


    setupPlayers() {
        this.dictPlayer = new DictationPlayer();
        this.bellPlayer = new BellPlayer();
    }

    setupPlayerEventListeners() {
        if (this.startBtn) this.startBtn.addEventListener("click", this.onStartClick);
        if (this.stopBtn) this.stopBtn.addEventListener("click", this.onStopClick);
    }

    async onStartClick() {
        if (!this.currentExercise) {
            console.warn("[ezmelo] 課題が選択されていません。");
            return;
        }
        console.log("[ezmelo] start-playlist clicked");
        //await this.dictPlayer.audioContext.resume?.();
        await Tone.start();
        const noteData = await getPlayableScoreDataFromMei(this.currentExercise.meiURL);
        this.dictPlayer.playNotes(noteData);
        this.bellPlayer.playBell(this.currentExercise.endBellSpec.bellId);
    }

    onStopClick() {
        console.log("[ezmelo] stop clicked");
        this.dictPlayer.stop();
    }

    async onSelectExercise(ex) {
        /* どこかかでenableTabs()かな？ */

        console.log("[ezmelo] selectExercise:", ex);
        this.currentExercise = ex;
        document.querySelector('.tab-button[data-tab="exercise"]').disabled = false;
        document.querySelector('.tab-button[data-tab="answer"]').disabled = false;
        document.querySelector('[data-tab="exercise"]').click();

        document.querySelector(".ezmelo-exercise-info")
            .innerHTML = this.formatExerciseInfo(ex.exerciseInfo);
        document.querySelector(".ezmelo-playback-info")
            .innerHTML = this.formatPlaybackInfo(ex.playbackDef);

        // 楽譜描画
        const container = document.getElementById("answer-score-container");
        container.innerHTML = `<div class="loading">楽譜を読み込み中…</div>`;
        try {
            await loadAndDisplayScore("answer-score-container", {}, ex.meiURL);
        } catch (e) {
            container.innerHTML = `<div class="error">楽譜の読み込みに失敗しました</div>`;
            console.error("[ezmelo] loadAndDisplayScore error:", e);
        }
    }

    formatExerciseInfo(info) {
        return `<h4>${info}</h4>`;
    }

    formatPlaybackInfo(defs) {
        if (!defs?.length) {
            return '<span class="no-playback-data-text">プレイバック情報: なし</span>';
        }
        const rows = defs.map((d, i) => `
      <tr><td>${i + 1}</td><td>${d.range}</td><td>${d.interval}</td></tr>
    `).join("");
        return `
      <table class="playback-table">
        <thead><tr><th>#</th><th>再生範囲</th><th>インターバル（秒）</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `.trim();
    }
}

// 起動コードも合わせて変更
document.addEventListener("DOMContentLoaded", () => {
    new EasyMelodyDictationApp().init();
});
