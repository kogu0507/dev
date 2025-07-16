/**
 * rhythmButtons.js
 * リズム選択ボタンの生成とインタラクションを管理するモジュール。
 * ユーザーがリズムボタンをクリックした際に、選択されたリズムを対応する表示エリアに表示し、
 * 選択されたボタンに視覚的なフィードバックを与える。
 */

/**
 * リズム選択ボタンを初期化し、イベントリスナーを設定する。
 * @param {HTMLElement} container - リズムボタンを挿入するDOM要素。
 * @param {HTMLElement} firstHalfDisplay - 前半のリズムを表示するDOM要素。
 * @param {HTMLElement} secondHalfDisplay - 後半のリズムを表示するDOM要素。
 * @param {NodeListOf<HTMLInputElement>} rhythmPositionRadios - リズム配置ラジオボタンのNodeList。
 * @param {Function} onRhythmSelectedCallback - リズムが選択されたときに呼び出されるコールバック関数 (rhythmId, selectedPosition) => void。
 * @param {Array<Object>} allRhythmsData - rhythms.jsonから読み込まれたすべてのリズムデータ。
 */
export function initializeRhythmButtons(container, firstHalfDisplay, secondHalfDisplay, rhythmPositionRadios, onRhythmSelectedCallback, allRhythmsData) {
    const template = document.getElementById('rhythm-button-template');
    if (!template) {
        console.error('Rhythm button template not found!');
        return;
    }

    // 既存のボタンをクリア
    container.innerHTML = '';

    // リズムボタンを動的に生成し、コンテナに追加
    // allRhythmsData を使用するように変更
    allRhythmsData.forEach(rhythm => {
        const clone = document.importNode(template.content, true);
        const button = clone.querySelector('.rhythm-select-button');
        const img = clone.querySelector('.rhythm-image');

        if (button && img) {
            button.dataset.rhythmId = rhythm.id; // データ属性でIDを保持
            img.src = rhythm.imagePath; // imagePath を使用するように変更
            img.alt = rhythm.description; // description を alt テキストとして使用

            // ボタンクリックイベントリスナーを追加
            button.addEventListener('click', () => {
                // 現在選択されているラジオボタンの値を取得
                let selectedPosition = 'first'; // デフォルトは前半
                rhythmPositionRadios.forEach(radio => {
                    if (radio.checked) {
                        selectedPosition = radio.value;
                    }
                });

                // 表示エリアをクリアし、選択されたリズム画像を追加
                let targetDisplay;
                if (selectedPosition === 'first') {
                    targetDisplay = firstHalfDisplay;
                } else {
                    targetDisplay = secondHalfDisplay;
                }

                // 既存の内容をクリアする代わりに、img要素を直接更新するように変更
                // これにより、HTML構造（pタグなど）が保持される
                let displayImgElement = targetDisplay.querySelector('.selected-rhythm-image');
                if (!displayImgElement) {
                    displayImgElement = document.createElement('img');
                    displayImgElement.classList.add('selected-rhythm-image');
                    targetDisplay.innerHTML = ''; // pタグを削除
                    targetDisplay.appendChild(displayImgElement);
                }
                displayImgElement.src = rhythm.imagePath;
                displayImgElement.alt = rhythm.description;


                // 選択されたボタンに'selected'クラスを追加し、他のボタンから削除
                const allRhythmButtons = container.querySelectorAll('.rhythm-select-button');
                allRhythmButtons.forEach(btn => {
                    btn.classList.remove('selected');
                });
                button.classList.add('selected');

                // コールバック関数を呼び出し、選択されたリズムのIDと位置を通知
                if (typeof onRhythmSelectedCallback === 'function') {
                    onRhythmSelectedCallback(rhythm.id, selectedPosition);
                }
            });

            container.appendChild(clone);
        } else {
            console.error('Failed to find button or image in template clone for rhythm:', rhythm.id);
        }
    });
}
