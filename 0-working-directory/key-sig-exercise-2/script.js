// script.js
// ESモジュールバンドルのエントリーポイント

// 1. データとモジュールのインポート
import { keySignatures, baseMeiTemplate } from './data/keySignatures.js';
import { initLang } from './modules/lang.js';
import { initSig2Name } from './modules/sig2name.js';
import { initName2Sig } from './modules/name2sig.js';
import { initModeToggle } from './modules/modeToggle.js';
import { renderKeySelectTables } from './modules/uiBuilder.js';
import { initSubTabs } from './modules/subTab.js';
import { show, hide } from './utils/dom.js';
import { showNotification, hideNotification } from './utils/notification.js';

// 2. DOMContentLoaded イベントで初期化を実行
//    <script type="module" src="./script.js" defer> を想定
document.addEventListener('DOMContentLoaded', () => {
  // リロード時は常に出題タブ（intro）を使用
  history.replaceState(null, '', window.location.pathname + window.location.search);

  // ラジオ群を動的に生成
  renderKeySelectTables();

  // 言語切替機能の初期化
  initLang();

  // モード（外側タブ）の切替制御
  initModeToggle(['intro', 'name2sig', 'summary']);

  // 各モード内のサブタブ初期化
  initSubTabs('intro');
  initSubTabs('name2sig');

  // 初期タブを強制的に出題タブに切り替え
  const tabBtnIntro = document.getElementById('tab-btn-intro');
  if (tabBtnIntro) tabBtnIntro.click();

  // 調号→調名モードの初期化
  initSig2Name();

  // 調名→調号モードの初期化
  initName2Sig();
});

window.handleModeTabChange = (newTabId) => {
  if (newTabId === 'name2sig') {
    // 初回だけ、あるいは毎回リフレッシュしたければここで
    generateName2SigQuestion();
  }
};