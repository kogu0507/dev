/**
 * rhythmButtons.js
 * リズム選択ボタンの生成とインタラクションを管理するモジュール。
 * ユーザーがリズムボタンをクリックした際に、選択されたリズムを対応する表示エリアに表示し、
 * 選択されたボタンに視覚的なフィードバックを与える。
 */

// リズムデータと画像URLのマッピング
const rhythmsData = [
    { id: "rhythm001", imageUrl: "https://storage.googleapis.com/kog-img/1.png", alt: "二分音符のリズムカード" },
    { id: "rhythm002", imageUrl: "https://storage.googleapis.com/kog-img/2.png", alt: "四分音符2つのリズムカード" },
    { id: "rhythm003", imageUrl: "https://storage.googleapis.com/kog-img/3.png", alt: "四分音符と八分音符2つのリズムカード" },
    { id: "rhythm004", imageUrl: "https://storage.googleapis.com/kog-img/4.png", alt: "八分音符2つと四分音符のリズムカード" },
    { id: "rhythm005", imageUrl: "https://storage.googleapis.com/kog-img/5.png", alt: "八分音符と四分音符と八分音符によるシンコペーションのリズムカード" },
    { id: "rhythm006", imageUrl: "https://storage.googleapis.com/kog-img/6.png", alt: "八分音符4つのリズムカード" },
    { id: "rhythm007", imageUrl: "https://storage.googleapis.com/kog-img/7.png", alt: "付点四分音符と八分音符のリズムカード" },
    { id: "rhythm008", imageUrl: "https://storage.googleapis.com/kog-img/8.png", alt: "八分音符と付点四分音符のリズムカード" },
    { id: "rhythm009", imageUrl: "https://storage.googleapis.com/kog-img/9.png", alt: "四分音符と二分音符のリズムカード" },
    { id: "rhythm010", imageUrl: "https://storage.googleapis.com/kog-img/10.png", alt: "二分音符と四分音符のリズムカード" },
    { id: "rhythm011", imageUrl: "https://storage.googleapis.com/kog-img/11.png", alt: "八分音符2つと八分音符2つのリズムカード" },
    { id: "rhythm012", imageUrl: "https://storage.googleapis.com/kog-img/12.png", alt: "四分音符と八分休符と八分音符のリズムカード" }
];

/**
 * リズム選択ボタンを初期化し、イベントリスナーを設定する。
 * @param {HTMLElement} container - リズムボタンを挿入するDOM要素。
 * @param {HTMLElement} firstHalfDisplay - 前半のリズムを表示するDOM要素。
 * @param {HTMLElement} secondHalfDisplay - 後半のリズムを表示するDOM要素。
 * @param {NodeListOf<HTMLInputElement>} rhythmPositionRadios - リズム配置ラジオボタンのNodeList。
 * @param {Function} onRhythmSelectedCallback - リズムが選択されたときに呼び出されるコールバック関数 (rhythmId, selectedPosition) => void。
 */
export function initializeRhythmButtons(container, firstHalfDisplay, secondHalfDisplay, rhythmPositionRadios, onRhythmSelectedCallback) {
    const template = document.getElementById('rhythm-button-template');
    if (!template) {
        console.error('Rhythm button template not found!');
        return;
    }

    // 既存のボタンをクリア
    container.innerHTML = '';

    // リズムボタンを動的に生成し、コンテナに追加
    rhythmsData.forEach(rhythm => {
        const clone = document.importNode(template.content, true);
        const button = clone.querySelector('.rhythm-select-button');
        const img = clone.querySelector('.rhythm-image');

        if (button && img) {
            button.dataset.rhythmId = rhythm.id; // データ属性でIDを保持
            img.src = rhythm.imageUrl;
            img.alt = rhythm.alt;

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

                targetDisplay.innerHTML = ''; // 既存の内容をクリア
                const selectedImg = document.createElement('img');
                selectedImg.src = rhythm.imageUrl;
                selectedImg.alt = rhythm.alt;
                selectedImg.classList.add('selected-rhythm-image'); // スタイル適用のためクラスを追加
                targetDisplay.appendChild(selectedImg);

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
