// modules/sig2name.js

import { keySignatures, baseMeiTemplate } from '../data/keySignatures.js';
import { renderVerovio } from './verovioLoader.js';
import { showNotification, hideNotification } from '../utils/notification.js';
import { $, $all, show, hide } from '../utils/dom.js';

/**
 * 調号→調名モードの初期化
 */
export function initSig2Name() {
  // 内部状態
  const state = {
    correct: null,       // 正解の meiValue
    userMajor: '',       // 選択中の長調
    userMinor: '',       // 選択中の短調
    result: null         // 採点結果
  };

  // 要素取得
  const majorGrid = $('#major-key-grid');
  const minorGrid = $('#minor-key-grid');
  const submitBtn = $('#submitAnswerBtn');
  const questionSt = $('#question-status');
  const notifSubmit = $('#submit-notification');
  const ansFeedback = $('#answer-feedback');
  const userMajDisp = $('#displayUserMajorAnswer');
  const userMinDisp = $('#displayUserMinorAnswer');
  const corrJpDisp = $('#displayCorrectAnswerJp');
  const corrEnDisp = $('#displayCorrectAnswerEn');
  const corrDeDisp = $('#displayCorrectAnswerDe');
  const ansViewer = $('#answer-viewer');
  const ansSt = $('#answer-status');
  const genBtn = $('#generate-new-question-btn');
  const newNotif = $('#new-question-notification');
  const questionVw = 'question-viewer';

  // 要素
  const qPane = $('#question-s2n');
  const aPane = $('#answer-s2n');
  
  // 「新しい問題を生成」
  async function generateNewQuestion() {
    hideNotification($('#submit-notification'));
    hideNotification($('#new-question-notification'));
    // 質問パネルを表示／回答パネルを隠す
    qPane.classList.remove('hidden');
    aPane.classList.add('hidden');
    // ランダムにキーを選ぶ
    const idx = Math.floor(Math.random() * keySignatures.length);
    const info = keySignatures[idx];
    state.correct = info.meiValue;
    state.userMajor = '';
    state.userMinor = '';
    state.result = null;

    // ラジオのチェックをクリア
    $all('input[name="majorKey"]').forEach(r => r.checked = false);
    $all('input[name="minorKey"]').forEach(r => r.checked = false);
    submitBtn.disabled = true;

    // 出題ステータス
    if (questionSt) questionSt.textContent = '譜例の調号を見て調名を答えましょう。';

    // SVG 描画
    const mei = baseMeiTemplate.replace('##KEY_SIG##', state.correct);
    await renderVerovio(questionVw, mei, 'question-status');
  }

  // 「解答」タブの更新
  function updateAnswerDisplay() {
    // state.result が null のときのみ「未解答」
    if (state.result === null) {
      // 未解答
      if (ansFeedback) {
        ansFeedback.innerHTML = 'まだ解答が送信されていません。<br>「出題」タブで選択し、送信してください。';
        ansFeedback.style.color = '#555';
      }
      return;
    }
    // ユーザー解答表示
    const info = keySignatures.find(k => k.meiValue === state.correct);
    const userMajInfo = keySignatures.find(k => k.meiValue === state.userMajor);
    const userMinInfo = keySignatures.find(k => k.meiValue === state.userMinor);

    if (userMajDisp) userMajDisp.textContent = userMajInfo?.nameMajorJp ?? '未選択';
    if (userMinDisp) userMinDisp.textContent = userMinInfo?.nameMinorJp ?? '未選択';

    // 正解表示
    if (corrJpDisp) corrJpDisp.textContent = `${info.nameMajorJp} / ${info.nameMinorJp}`;
    if (corrEnDisp) corrEnDisp.textContent = `${info.nameMajorEn} / ${info.nameMinorEn}`;
    if (corrDeDisp) corrDeDisp.textContent = `${info.nameMajorDe} / ${info.nameMinorDe}`;

    // フィードバック
    if (ansFeedback) {
      if (state.result) {
        ansFeedback.textContent = '🎉 正解です！';
        ansFeedback.style.color = 'green';
      } else {
        ansFeedback.textContent = '残念、不正解です。';
        ansFeedback.style.color = 'red';
      }
    }

    // 正解楽譜を表示
    const correctMei = baseMeiTemplate.replace('##KEY_SIG##', state.correct);
    renderVerovio('answer-viewer', correctMei, 'answer-status');
  }

  // イベント：長調選択
  if (majorGrid) {
    majorGrid.addEventListener('change', e => {
      if (e.target.name === 'majorKey') {
        state.userMajor = e.target.value;
        submitBtn.disabled = !(state.userMajor && state.userMinor);
      }
    });
  }
  // イベント：短調選択
  if (minorGrid) {
    minorGrid.addEventListener('change', e => {
      if (e.target.name === 'minorKey') {
        state.userMinor = e.target.value;
        submitBtn.disabled = !(state.userMajor && state.userMinor);
      }
    });
  }
  // イベント：解答送信
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const ok = (state.userMajor === state.correct) && (state.userMinor === state.correct);
      state.result = ok;
      showNotification($('#submit-notification'), '送信完了！');
      // 回答パネルを表示／質問パネルを隠す
      qPane.classList.add('hidden');
      aPane.classList.remove('hidden');
      updateAnswerDisplay();
      });
  }
  // イベント：新しい問題
  if (genBtn) {
    genBtn.addEventListener('click', () => {
      generateNewQuestion();
      showNotification($('#new-question-notification'), '新しい問題が生成されました！');
      document.getElementById('tab-btn-intro')?.click();
    });
  }


  // 初期生成
  generateNewQuestion();
}
