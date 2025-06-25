// modules/name2sig.js

import { keySignatures, baseMeiTemplate } from '../data/keySignatures.js';
import { renderVerovio } from './verovioLoader.js';
import { showNotification, hideNotification } from '../utils/notification.js';
import { $, show, hide } from '../utils/dom.js';

/**
 * 調名→調号モードの初期化
 */
export function initName2Sig() {
  // 内部状態
  const state = { correct: null, current: null };

  // パネル要素
  const qPane = $('#question-n2s');
  const aPane = $('#answer-n2s');
  const decBtn = $('#decreaseAccBtn');
  const incBtn = $('#increaseAccBtn');
  const submitBtn = $('#submitName2SigBtn');
  const genBtn = $('#generate-n2s-question-btn');
  const statusEl = $('#name2sig-status');
  const notifEl = $('#name2sig-notification');

  // 表示要素
  const userAnswer = $('#displayN2SUserAnswer');
  const correctAns = $('#displayN2SCorrectAnswer');

  // Verovio ターゲット
  const qViewerId = 'name2sig-viewer';
  const aViewerId = 'name2sig-answer-viewer';

  /**
   * 新しい問題を生成し、譜例を表示
   */
  function generateQuestion() {
    hideNotification(notifEl);
    hide($('#new-n2s-notification'));

    // ランダムで正解となる調号を選択
    state.correct = Math.floor(Math.random() * keySignatures.length);
    // 初期表示も正解と同じに
    state.current = state.correct;

    // 質問パネル表示／回答パネル隠す
    show(qPane);
    hide(aPane);
    submitBtn.disabled = true;
    statusEl.textContent = '矢印で調号を調整し、解答を送信してください。';

    // Verovio 描画
    const mei = baseMeiTemplate.replace('##KEY_SIG##', keySignatures[state.current].meiValue);
    renderVerovio(qViewerId, mei);
  }

  /**
   * 答え合わせパネルを表示
   */
  function showAnswer() {
    // ユーザーの調号名称を表示
    const u = keySignatures[state.current];
    const c = keySignatures[state.correct];
    userAnswer.textContent = `${u.nameMajorJp} / ${u.nameMinorJp}`;
    correctAns.textContent = `${c.nameMajorJp} / ${c.nameMinorJp}`;

    // 正解譜例を表示
    renderVerovio(aViewerId, baseMeiTemplate.replace('##KEY_SIG##', c.meiValue));

    // 質問パネル隠す／回答パネル表示
    hide(qPane);
    show(aPane);
  }

  // フラットボタン
  decBtn.addEventListener('click', () => {
    if (state.current > 0) {
      state.current--;
      const mei = baseMeiTemplate.replace('##KEY_SIG##', keySignatures[state.current].meiValue);
      renderVerovio(qViewerId, mei);
      submitBtn.disabled = false;
    }
  });

  // シャープボタン
  incBtn.addEventListener('click', () => {
    if (state.current < keySignatures.length - 1) {
      state.current++;
      const mei = baseMeiTemplate.replace('##KEY_SIG##', keySignatures[state.current].meiValue);
      renderVerovio(qViewerId, mei);
      submitBtn.disabled = false;
    }
  });

  // 解答送信ボタン
  submitBtn.addEventListener('click', () => {
    showNotification(notifEl, '解答を送信しました！');
    showAnswer();
  });

  // 新しい問題ボタン
  genBtn.addEventListener('click', () => {
    generateQuestion();
    showNotification($('#new-n2s-notification'), '新しい問題が生成されました！');
  });
  /* 
    // 外側タブクリックで初回のみ問題生成
    const tabBtn = document.getElementById('tab-btn-name2sig');
    let firstTime = true;
    tabBtn.addEventListener('click', () => {
      if (firstTime) {
        generateQuestion();
        firstTime = false;
      }
    });
  
   */


  // initName2Sig 関数が generateQuestion を返すように変更
  return {
    generateQuestion: generateQuestion
  };
}


