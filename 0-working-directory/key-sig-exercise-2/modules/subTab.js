// modules/subTab.js

/**
 * モード内のサブタブ (Question/Answer) を初期化する
 * @param {string} modeId - 親モードパネルの ID (例: 'intro', 'name2sig')
 */
export function initSubTabs(modeId) {
  const container = document.getElementById(modeId);
  if (!container) return;

  const btns = container.querySelectorAll('.sub-tab-button');
  const panes = container.querySelectorAll('.sub-tab-content');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.subtab;
      // ボタンの active クラス
      btns.forEach(b => b.classList.toggle('active', b === btn));
      // コンテンツの表示切替
      panes.forEach(p => {
        p.classList.toggle('hidden', p.dataset.subtab !== target);
      });
    });
  });

  // 最初は問題タブを選択
  const first = container.querySelector('.sub-tab-button');
  if (first) first.click();
}
