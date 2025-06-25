// modules/uiBuilder.js

import { keySignatures } from '../data/keySignatures.js';

const letters = ['C','D','E','F','G','A','B'];
const accidentals = [
  { label: '♭', enSuffix: 'b'  },
  { label: '♮', enSuffix: ''   },
  { label: '♯', enSuffix: '#'  }
];

/**
 * major／minor 両方のテーブルを動的に生成
 */
export function renderKeySelectTables() {
  ['major','minor'].forEach(mode => {
    const table = document.getElementById(`${mode}-key-grid`);
    if (!table) return;

    // 1) thead 部分を生成
    let html = '<thead><tr><th></th>';
    html += accidentals.map(acc => `<th>${acc.label}</th>`).join('');
    html += '</tr></thead><tbody>';

    // 2) tbody 部分を生成
    letters.forEach(letter => {
      html += `<tr><th>${letter}</th>`;
      accidentals.forEach(acc => {
        const displayName = `${letter}${acc.enSuffix} ${mode === 'major' ? 'Major' : 'Minor'}`;
        // keySignatures から対応するオブジェクトを探す
        const ks = (mode === 'major'
          ? keySignatures.find(k => k.nameMajorEn === displayName)
          : keySignatures.find(k => k.nameMinorEn === displayName)
        );
        const mei = ks?.meiValue || '';
        const disabled = ks ? '' : 'disabled';
        html += `<td>
          <label>
            <input type="radio" name="${mode}Key" value="${mei}" ${disabled}>
            <span data-key-type="${mode}" data-mei-value="${mei}" class="music-key"></span>
          </label>
        </td>`;
      });
      html += '</tr>';
    });

    html += '</tbody>';
    table.innerHTML = html;
  });
}
