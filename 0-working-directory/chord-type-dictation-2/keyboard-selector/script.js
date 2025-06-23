// keybord-selector/script.js

// ページが完全に読み込まれた後に実行
document.addEventListener('DOMContentLoaded', () => {
    // 全ての鍵盤要素を取得
    const keyboardNotes = document.querySelectorAll('.scs-keyboard-note');

    // 選択された鍵盤のdata-id（MIDIノートナンバー）を保存する配列
    const selectedNotes = [];

    // 各鍵盤にクリックイベントリスナーを追加
    keyboardNotes.forEach(note => {
        note.addEventListener('click', () => {
            const noteId = parseInt(note.dataset.id, 10); // data-idを数値として取得
            const checkMarkSpan = note.querySelector('.scs-check-mark'); // この鍵盤内のチェックマーク要素を取得

            if (checkMarkSpan) { // チェックマーク要素が存在することを確認
                // 鍵盤自身の選択状態クラスをトグル
                note.classList.toggle('is-selected');

                // チェックマークの表示/非表示をトグル
                checkMarkSpan.classList.toggle('hidden');

                // 選択状態に応じてselectedNotes配列を更新
                if (note.classList.contains('is-selected')) { // 鍵盤が選択状態になった場合
                    // 選択された場合、配列に追加（重複を避ける）
                    if (!selectedNotes.includes(noteId)) {
                        selectedNotes.push(noteId);
                    }
                } else { // 鍵盤が選択解除された場合
                    // 選択解除された場合、配列から削除
                    const index = selectedNotes.indexOf(noteId);
                    if (index > -1) {
                        selectedNotes.splice(index, 1);
                    }
                }

                // (デバッグ用) 現在選択されている音を確認
                console.log('現在選択されている音:', selectedNotes.sort((a, b) => a - b));
            }
        });
    });
});