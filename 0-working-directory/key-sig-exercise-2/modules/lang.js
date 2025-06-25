// modules/lang.js

import { keySignatures } from '../data/keySignatures.js';

/**
 * .music-key 要素のテキストを選択言語で更新
 * @param {'ja'|'en'|'de'} lang
 */
export function updateKeyNames(lang) {
  const spans = document.querySelectorAll('span[data-key-type][data-mei-value]');
  spans.forEach(span => {
    const type = span.dataset.keyType;         // 'major' or 'minor'
    const mei = span.dataset.meiValue;         // e.g. "2s"
    const info = keySignatures.find(k => k.meiValue === mei);
    if (!info) return;
    let text = '';
    if (type === 'major') {
      text = lang === 'en' ? info.nameMajorEn
           : lang === 'de' ? info.nameMajorDe
           : info.nameMajorJp;
    } else {
      text = lang === 'en' ? info.nameMinorEn
           : lang === 'de' ? info.nameMinorDe
           : info.nameMinorJp;
    }
    span.textContent = text;
  });
}

/**
 * 初期言語ラジオの状態を読み取り、updateKeyNames を呼び出す
 */
export function initLang() {
  const selector = document.getElementById('language-selector');
  if (!selector) return;
  // ラジオ切替イベント
  selector.addEventListener('change', e => {
    if (e.target.name === 'lang') {
      updateKeyNames(e.target.value);
    }
  });
  // 初期化：checked なラジオから
  const initial = selector.querySelector('input[name="lang"]:checked')?.value;
  if (initial) updateKeyNames(initial);
}
