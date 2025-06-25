// modules/lang.js

import { keySignatures } from '../data/keySignatures.js';

/**
 * 調号情報を meiValue → オブジェクト で高速に取り出せる Map
 * 初期化時に一度だけ作成します
 * @type {Map<string, typeof keySignatures[0]>}
 */
const sigMap = new Map(
  keySignatures.map(item => [item.meiValue, item])
);

/**
 * span[data-key-type][data-mei-value] 要素のテキストを
 * 指定の言語（ja/en/de）で更新します
 * @param {'ja'|'en'|'de'} lang
 */
export function updateKeyNames(lang) {
  // 対象の <span> 要素をまとめて取得
  const spans = document.querySelectorAll(
    'span[data-key-type][data-mei-value]'
  );

  spans.forEach(span => {
    // data 属性からモード（major/minor）と meiValue を取得
    const type = span.dataset.keyType;   // 'major' or 'minor'
    const mei   = span.dataset.meiValue; // e.g. "2s"

    // Map から情報オブジェクトを取り出し
    const info = sigMap.get(mei);
    if (!info) return; // 見つからなければスキップ

    // 'major' → 'Major', 'minor' → 'Minor'
    const typeCapital = type.charAt(0).toUpperCase() + type.slice(1);

    // 言語コードをキーの一部に変換: ja→Jp, en→En, de→De
    const langKey =
      lang === 'en' ? 'En'
    : lang === 'de' ? 'De'
    : 'Jp'; // デフォルトは日本語

    // プロパティ名を動的に生成
    // 例: name + Major + En → nameMajorEn
    const propName = `name${typeCapital}${langKey}`;

    // プロパティから名称を取り出し、テキストにセット
    span.textContent = info[propName] || '';
  });
}

/**
 * 言語切替ラジオボタンの初期化
 * - change イベントで updateKeyNames を呼び出し
 * - ページロード時に checked ラジオの値で一度実行
 */
export function initLang() {
  const selector = document.getElementById('language-selector');
  if (!selector) return;

  // ラジオ切替時のイベントハンドラ
  selector.addEventListener('change', e => {
    const target = /** @type {HTMLInputElement} */ (e.target);
    // ラジオ以外の変化は無視
    if (target.name !== 'lang') return;

    // 値が en/de でなければ ja とみなす
    const value = target.value;
    const lang = (value === 'en' || value === 'de') ? value : 'ja';

    updateKeyNames(lang);
  });

  // 初期化：checked なラジオの値で一度だけ更新
  const checked = selector.querySelector(
    'input[name="lang"]:checked'
  );
  const initialValue = checked?.value;
  const initialLang =
    initialValue === 'en' || initialValue === 'de'
      ? initialValue
      : 'ja';

  updateKeyNames(initialLang);
}
