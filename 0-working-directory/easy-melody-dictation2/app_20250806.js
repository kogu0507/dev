// app.js
// 全体の初期化とタブ／ボタンの紐付けを行います

/* ========================================
  インポート
 ========================================*/
import {
  setupVerovioManager,
  setVerovioRenderOptions,
  loadAndDisplayScore,
  getPlayableScoreDataFromMei,
} from "./verovio.js";
import {
  DictationPlayer,
  BellPlayer,
} from "./audio-player.js";


/* ========================================
  グローバル変数・定数
 ========================================*/
let dictPlayer; // グローバルスコープで宣言
let bellPlayer; // グローバルスコープで宣言
let currentExercise = null; // 現在選択されている課題を保持する変数

const VER_RENDER_OPTIONS = {
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
  minLastJustification: 0
};


/* ========================================
  イベントリスナー
 ========================================*/
document.addEventListener('DOMContentLoaded', () => {
  initializeApplication();
});

// グローバルなイベントリスナーは初期化時に一度だけ設定
function setupPlayerEventListeners() {
  const startBtn = document.querySelector('[data-role="start-playlist"]');
  if (startBtn) {
    startBtn.addEventListener("click", async () => {
      if (!currentExercise) {
        console.warn("[ezmelo] 課題が選択されていません。");
        return;
      }
      console.log("[ezmelo] start-playlist clicked");
      try {
        const noteData = await getPlayableScoreDataFromMei(currentExercise.meiURL);
        dictPlayer.playNotes(noteData);
        bellPlayer.playBell(currentExercise.endBellSpec.bellId);
      } catch (e) {
        console.error("[ezmelo] 再生処理でエラー:", e);
      }
    });
  } else {
    console.error("[ezmelo] start-playlist ボタンが見つかりません。");
  }

  const stopBtn = document.querySelector('[data-role="stop"]');
  if (stopBtn) {
    stopBtn.addEventListener("click", () => {
      console.log("[ezmelo] stop clicked");
      dictPlayer.stop();
    });
  } else {
    console.error("[ezmelo] stop ボタンが見つかりません。");
  }
}



/* ========================================
  関数
 ========================================*/

async function initializeApplication() {
  console.log("[ezmelo] initializeApplication start");

  // 1. JSON 読み込み
  const jsonEl = document.getElementById("ezmelo-json-data");
  const exercises = JSON.parse(jsonEl.textContent.trim());
  console.log("[ezmelo] exercises loaded:", exercises);

  // 2. 課題選択セクションにボタン生成
  const selSec = document.querySelector(".ezmelo-exercise-selection-section");
  selSec.innerHTML = "";
  exercises.forEach((ex) => {
    const btn = document.createElement("button");
    btn.textContent = `${ex.id}：${ex.exerciseInfo}`;
    btn.addEventListener("click", () => selectExercise(ex));
    selSec.appendChild(btn);
  });

  // 3. Verovio 初期化
  await setupVerovioManager();

  // 4. Verovio レンダリングオプション設定
  setVerovioRenderOptions(VER_RENDER_OPTIONS);

  // 5. 初期状態で「課題」と「解答」タブを無効化
  const tabButtonsToDisable = [
    document.querySelector('.tab-button[data-tab="exercise"]'),
    document.querySelector('.tab-button[data-tab="answer"]')
  ];
  disableElements(tabButtonsToDisable);


  // 6. プレイヤーを一度だけ初期化
  dictPlayer = new DictationPlayer();
  bellPlayer = new BellPlayer();

  // —— ここでイベントリスナーをセットアップ —— 
  setupPlayerEventListeners();
  console.log("[ezmelo] player event listeners set up");

  console.log("[ezmelo] initializeApplication done");
}

/**
 * ボタンクリック時の処理
 */
async function selectExercise(ex) {
  console.log("[ezmelo] selectExercise:", ex);

  // 汎用関数を使ってタブを有効化
  const tabButtonsToEnable = [
    document.querySelector('.tab-button[data-tab="exercise"]'),
    document.querySelector('.tab-button[data-tab="answer"]')
  ];
  enableElements(tabButtonsToEnable);

  // 選択された課題をグローバル変数に保存
  currentExercise = ex;

  // (a) 「課題」タブを開く
  document.querySelector('[data-tab="exercise"]').click();

  // (b) 課題情報表示
  document.querySelector(".ezmelo-exercise-info").innerHTML = formatExerciseInfo(ex.exerciseInfo);
  document.querySelector(".ezmelo-playback-info").innerHTML = formatPlaybackInfo(ex.playbackDef);


  // (c) 楽譜描画
  const container = document.getElementById("answer-score-container");
  container.innerHTML = `<div class="loading">楽譜を読み込み中…</div>`;
  try {
    await loadAndDisplayScore(
      "answer-score-container",
      {}, // レイアウトオプション
      ex.meiURL
    );
  } catch (e) {
    container.innerHTML = `<div class="error">楽譜の読み込みに失敗しました</div>`;
    console.error("[ezmelo] loadAndDisplayScore error:", e);
  }


}

/**
 * 課題情報を整形してHTML文字列として返します。
 * @param {string} info - 課題情報文字列 (例: "ハ長調 4/4拍子 4小節")
 * @returns {string} 整形されたHTML文字列
 */
function formatExerciseInfo(info) {
  // pタグなのか？検討
  return `<p>${info}</p>`;
}


/**
 * プレイバック定義を整形してHTML文字列（テーブル形式）として返します。
 * @param {Array<object>} playbackDef - プレイバック定義の配列
 * @returns {string} 整形されたHTML文字列（<table>要素を含む）
 */
function formatPlaybackInfo(playbackDef) {
  if (!playbackDef?.length) {
    return '<span class="no-playback-data-text">プレイバック情報: なし</span>';
  }
  let rows = playbackDef.map((def, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${def.range}</td>
      <td>${def.interval}</td>
    </tr>
  `).join("");

  return `
    <table class="playback-table">
      <thead>
        <tr><th>#</th><th>再生範囲</th><th>インターバル（秒）</th></tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `.trim();
}







/* ====================
  汎用関数
==================== */

// 要素を無効化する汎用関数
function disableElements(elements) {
  elements.forEach(element => {
    if (element) {
      element.disabled = true;
      element.classList.add('is-disabled');
    }
  });
}

// 要素を有効化する汎用関数
function enableElements(elements) {
  elements.forEach(element => {
    if (element) {
      element.disabled = false;
      element.classList.remove('is-disabled');
    }
  });
}