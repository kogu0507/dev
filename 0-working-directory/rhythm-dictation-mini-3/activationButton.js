/**
 * activationButton.js
 * 「聴音を開始」ボタンのロジックを管理するモジュール。
 * Tone.jsの初期化、ウォームアップ音の再生、およびUIの切り替えを行う。
 */

/**
 * 「聴音を開始」ボタンの初期化と、ウォームアップ＋課題音のスケジュール管理を行う。
 *
 * @param {HTMLElement} buttonElement - 「聴音を開始」ボタンのDOM要素
 * @param {HTMLElement} targetDisplayElement - ウォームアップ後に表示するメインコンテンツのDOM要素
 * @param {Tone.Synth} synth - Tone.js のシンセサイザーインスタンス
 * @param {number} volume - 再生音量 (0.0 - 1.0)
 * @param {Array<Object>} warmupNotes - ウォームアップ用ノート配列
 * （{ time: string, note: string, duration: string, velocity: number } のリスト）
 * @param {Function} playFirstQuestionCallback - ウォームアップ後に最初の課題音を再生するためのコールバック関数
 * @param {number} tempo - Transport の BPM。省略時は 120
 */
export function initializeActivationButton(
  buttonElement,
  targetDisplayElement,
  synth,
  volume,
  warmupNotes,
  playFirstQuestionCallback, // taskNotes を削除し、コールバックを追加
  tempo = 120
) {
  // 必須要素がそろっているかチェック
  // taskNotes のチェックを削除
  if (!buttonElement || !targetDisplayElement || !synth || !Array.isArray(warmupNotes) || typeof playFirstQuestionCallback !== 'function') {
    console.error('initializeActivationButton: 引数が不正です。');
    return;
  }

  // Transport の全体設定（１度だけ）
  Tone.Transport.bpm.value = tempo;             // テンポを明示的に設定
  synth.volume.value = Tone.gainToDb(volume);   // シンセ音量をデシベルに変換して設定

  // 各 Part の生成ヘルパー
  function createPart(notesArray) {
    return new Tone.Part((time, event) => {
      synth.triggerAttackRelease(
        event.note,
        event.duration,
        time,
        event.velocity
      );
    }, notesArray);
  }

  // 総再生時間を秒で計算するヘルパー
  function calcTotalDuration(notesArray) {
    // 最後のノートの time+duration を Tone.Time で合算して秒数化
    const last = notesArray[notesArray.length - 1];
    const endTimeStr = `${last.time} + ${last.duration}`;
    return Tone.Time(endTimeStr).toSeconds();
  }

  buttonElement.addEventListener('click', async () => {
    console.log('「聴音を開始」ボタン クリック → AudioContext 起動');
    await Tone.start();             // ユーザー操作による AudioContext の起動
    console.log('AudioContext started');

    // もし既に走っていたら一旦クリア
    if (Tone.Transport.state === 'started') {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      console.log('既存の Transport を停止＆キャンセル');
    }

    // Part を生成
    const warmupPart = createPart(warmupNotes);
    // taskPart の生成はここで行わない。コールバックに任せる。

    // 再生オフセットを設定
    const warmupDuration = calcTotalDuration(warmupNotes);
    const gap = 0.1;    // ウォームアップ終了後の余裕時間（秒）

    // Transport 上にスケジュール
    warmupPart.start(0);                            // 0 秒からウォームアップ

    // UI 切り替え：ウォームアップ終了時にボタンを隠して target を表示
    // その後、最初の課題音を再生するコールバックを呼び出す
    Tone.Transport.scheduleOnce(() => {
      buttonElement.classList.add('visually-hidden');
      targetDisplayElement.classList.remove('visually-hidden');
      console.log('ウォームアップ終了 → UI 切り替え');

      // 最初の課題音を再生するコールバックを呼び出す
      playFirstQuestionCallback();

    }, warmupDuration);

    // Transport 停止＆リソース解放：
    // ウォームアップ Part は再生終了時に dispose
    Tone.Transport.scheduleOnce(() => {
      warmupPart.dispose();
      console.log('ウォームアップ Part 解放');
      // Transport の停止は playRhythmMidi の中で行われるため、ここでは行わない
    }, warmupDuration + gap); // ウォームアップ終了 + ギャップの後に dispose

    // Transport をスタート（すべての schedule が有効化）
    Tone.Transport.start();
    console.log('Transport started');
  });
}
