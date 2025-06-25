// modules/uiBuilder.js

import { keySignatures } from '../data/keySignatures.js';

// 定数化: モード名、ラジオの name 属性、データ属性、クラス名
const MODES = ['major', 'minor'];
const RADIO_NAME = { major: 'majorKey', minor: 'minorKey' };
const DATA_KEY_TYPE = 'data-key-type';
const DATA_MEI_VALUE = 'data-mei-value';
const CLASS_MUSIC_KEY = 'music-key';

// 列ヘッダー用の音名と臨時記号
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ACCIDENTALS = [
  { label: '♭', enSuffix: 'b' },
  { label: '♮', enSuffix: '' },
  { label: '♯', enSuffix: '#' }
];

// displayNameEn から meiValue への高速検索用 Map を生成
const majorMap = new Map();
const minorMap = new Map();
keySignatures.forEach(k => {
  majorMap.set(k.nameMajorEn, k.meiValue);
  minorMap.set(k.nameMinorEn, k.meiValue);
});

/**
 * major/minor 両方のテーブルを動的に生成
 * DOM API を用いて堅牢に構築
 */
export function renderKeySelectTables() {
  MODES.forEach(mode => {
    const table = document.getElementById(`${mode}-key-grid`);
    if (!table) return; // テーブルがなければスキップ

    // テーブルをクリア
    table.innerHTML = '';

    // thead を作成
    const thead = table.createTHead();
    const headRow = thead.insertRow();
    // 左上セルは空
    const emptyTh = document.createElement('th');
    headRow.appendChild(emptyTh);
    ACCIDENTALS.forEach(acc => {
      const th = document.createElement('th');
      th.textContent = acc.label;
      headRow.appendChild(th);
    });

    // tbody を作成
    const tbody = table.createTBody();

    LETTERS.forEach(letter => {
      const row = tbody.insertRow();
      // 1列目に音名ラベル
      const th = document.createElement('th');
      th.textContent = letter;
      row.appendChild(th);

      // 各セルを生成
      ACCIDENTALS.forEach(acc => {
        const td = document.createElement('td');

        // 英語表記名を組み立て
        const displayName =
          `${letter}${acc.enSuffix} ${mode === 'major' ? 'Major' : 'Minor'}`;
        // Map から meiValue を取得
        const meiValue =
          mode === 'major' ? majorMap.get(displayName) : minorMap.get(displayName);

        // ラベル要素を構築
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = RADIO_NAME[mode];
        input.value = meiValue || '';
        if (!meiValue) input.disabled = true;

        const span = document.createElement('span');
        span.setAttribute(DATA_KEY_TYPE, mode);
        span.setAttribute(DATA_MEI_VALUE, meiValue || '');
        span.classList.add(CLASS_MUSIC_KEY);

        // label に input と span を追加
        label.appendChild(input);
        label.appendChild(span);
        td.appendChild(label);
        row.appendChild(td);
      });
    });
  });
}
