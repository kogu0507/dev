// modules/uiBuilder.js

import { keySignatures } from '../data/keySignatures.js';

const letters = ['C','D','E','F','G','A','B'];
const accidentals = [
    { label: '♭', enSuffix: 'b' },
    { label: '♮', enSuffix: '' },
    { label: '♯', enSuffix: '#' }
];

/**
 * このモジュールが使用するCSSファイルを動的にロードします。
 * script.jsなどの親ファイルから呼び出されることを想定しています。
 */
export function loadUiBuilderCss() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';

    // import.meta.url を使って、この uiBuilder.js ファイル自身のURLを取得し、
    // そのディレクトリパスから uiBuilder.css を参照する
    const currentModuleUrl = import.meta.url;
    const currentModuleDir = currentModuleUrl.substring(0, currentModuleUrl.lastIndexOf('/'));
    link.href = currentModuleDir + '/uiBuilder.css'; // uiBuilder.js と同じディレクトリにある uiBuilder.css を参照

    document.head.appendChild(link);
    console.log('[uiBuilder] uiBuilder.css を動的にロードしました。');
}

/**
 * major／minor 両方のテーブルを動的に生成
 */
export function renderKeySelectTables() {
    ['major','minor'].forEach(mode => {
        const table = document.getElementById(`${mode}-key-grid`);
        if (!table) {
            console.warn(`[uiBuilder] テーブル要素 '${mode}-key-grid' が見つかりません。`);
            return;
        }

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
        console.log(`[uiBuilder] ${mode} 調選択テーブルのHTMLを生成しました。`);
    });
}