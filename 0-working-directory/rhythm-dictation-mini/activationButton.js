/**
 * activationButton.js
 * 「聴音を開始」ボタンのロジックを管理するモジュール。
 * Tone.jsの初期化、ウォームアップ音の再生、およびUIの切り替えを行う。
 */

/**
 * 「聴音を開始」ボタンを初期化し、イベントリスナーを設定する。
 * @param {HTMLElement} buttonElement - 「聴音を開始」ボタンのDOM要素。
 * @param {HTMLElement} targetDisplayElement - ウォームアップ後に表示するメインコンテンツのDOM要素（例: question-main）。
 * @param {Object} synth - Tone.jsのシンセサイザーインスタンス。
 * @param {number} volume - 再生音量 (0.0 - 1.0)。
 */
export function initializeActivationButton(buttonElement, targetDisplayElement, synth, volume) {
    if (!buttonElement || !targetDisplayElement || !synth) {
        console.error('Activation button, target display element, or synth not found!');
        return;
    }

    buttonElement.addEventListener('click', async (event) => {
        console.log('「聴音を開始」ボタンがクリックされました。');

        // AudioContextを起動 (ユーザーインタラクションが必要)
        await Tone.start();
        Tone.Transport.start();

        // ウォームアップ音
        const now = Tone.now();
        synth.volume.value = Tone.gainToDb(volume); // 音量をデシベルに変換して設定
        synth.triggerAttackRelease("C5", "8n", now, volume);
        synth.triggerAttackRelease("E5", "8n", now + 0.1, volume);
        synth.triggerAttackRelease("G5", "16n", now + 0.2, volume);

        // ウォームアップ音が鳴り終わった後に表示を切り替える
        // ウォームアップ音の再生時間に合わせて調整 (0.2秒の音符が鳴り終わる少し後)
        Tone.Transport.scheduleOnce(() => {
            // 「聴音を開始」ボタンを非表示にする
            buttonElement.classList.add('visually-hidden');

            // question-main から visually-hidden を削除して表示する
            targetDisplayElement.classList.remove('visually-hidden');

            Tone.Transport.stop();
            console.log('ウォームアップ後、Tone.Transportを停止しました。');

            // 最初の問題を生成 (必要であればここで呼び出す)
            // generateNewQuestion(); // generateNewQuestionはscript.jsで定義されるため、直接呼び出せない。
                                  // 必要であればコールバック関数として渡すか、イベントを発火させる。
        }, now + 0.5); // ウォームアップ音の再生が完了する少し後 (例: 0.5秒後)
    });
}
