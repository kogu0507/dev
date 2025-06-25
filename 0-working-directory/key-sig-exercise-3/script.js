// script.js
// ================================
// エントリーポイント
// ================================

// 1. データとモジュールのインポート
import { keySignatures, baseMeiTemplate } from './data/keySignatures.js';
import { initLang } from './modules/lang.js';
import { initSig2Name } from './modules/sig2name.js';
import { initName2Sig, generateName2SigQuestion }
  from './modules/name2sig.js';
import { renderKeySelectTables } from './modules/uiBuilder.js';
import { show, hide, $ } from './utils/dom.js';
import { showNotification, hideNotification }
  from './utils/notification.js';

// 2. DOMContentLoaded でアプリを初期化
document.addEventListener('DOMContentLoaded', initApp);

/**
 * アプリ全体の初期化
 */
function initApp() {
  resetHistory();
  setupUI();
  setupModes();
}

/**
 * ページ読み込み時の履歴リセット
 */
function resetHistory() {
  history.replaceState(
    null,
    '',
    window.location.pathname + window.location.search
  );
}

/**
 * UI（テーブル・言語切替）の初期化
 */
function setupUI() {
  renderKeySelectTables();
  initLang();
}


/**
 * 各モードの初回初期化処理
 */
function setupModes() {
  initSig2Name();    // 調号→調名モード
  initName2Sig();    // 調名→調号モード
}

// simple-tab-component 用にグローバルに露出
window.handleModeTabChange = function (newTabId) {
  if (newTabId === 'name2sig') {
    generateName2SigQuestion();
  }
};