// modules/modeToggle.js

/**
 * ラジオボタン(value)に対応する<section id="...">を切り替え
 * @param {string[]} modeIds - ラジオ value と同名のセクションIDリスト
 */
export function initModeToggle(modeIds) {
  // ラジオ要素を取得
  const radios = document.querySelectorAll('input[name="mode"]');
  // value→section 要素マップ
  const sections = modeIds.reduce((map, id) => {
    map[id] = document.getElementById(id);
    return map;
  }, {});

  // 実際の表示切替ロジック
  function update(selected) {
    modeIds.forEach(id => {
      if (sections[id]) {
        if (id === selected) {
          sections[id].classList.remove('hidden');
        } else {
          sections[id].classList.add('hidden');
        }
      }
    });
  }

  // イベント登録
  radios.forEach(radio => {
    radio.addEventListener('change', e => {
      update(e.target.value);
    });
  });

  // 初期表示
  const initial = document.querySelector('input[name="mode"]:checked')?.value;
  if (initial) update(initial);
}
