// modules/sig2name.js

import { keySignatures, baseMeiTemplate } from '../data/keySignatures.js';
import { renderVerovio } from './verovioLoader.js';
import { showNotification, hideNotification } from '../utils/notification.js';
import { $, $all, show, hide } from '../utils/dom.js';

/**
 * meiValue → 調号情報 の Map を一度だけ作成
 * @type {Map<string, typeof keySignatures[0]>}
 */
const sigMap = new Map(
  keySignatures.map(item => [item.meiValue, item])
);

/**
 * モード内で共有する状態オブジェクト
 * @property {string} correct    正解の meiValue
 * @property {string} userMajor  ユーザーが選択中の長調 meiValue
 * @property {string} userMinor  ユーザーが選択中の短調 meiValue
 */
const state = {
  correct: '',
  userMajor: '',
  userMinor: '',
};

/**
 * 質問ビューアを描画
 */
function renderQuestion() {
  const meiXml = baseMeiTemplate.replace('##KEY_SIG##', state.correct);
  renderVerovio('question-viewer', meiXml);
}

/**
 * 回答ビューアとフィードバックを描画
 */
function renderAnswer() {
  const correctInfo = sigMap.get(state.correct);
  const userMajInfo = sigMap.get(state.userMajor);
  const userMinInfo = sigMap.get(state.userMinor);

  // ユーザー回答表示
  $('#displayUserMajorAnswer').textContent = userMajInfo?.nameMajorJp ?? '';
  $('#displayUserMinorAnswer').textContent = userMinInfo?.nameMinorJp ?? '';

  // 正解表示 (各言語)
  $('#displayCorrectAnswerJp').textContent = 
    `${correctInfo.nameMajorJp} / ${correctInfo.nameMinorJp}`;
  $('#displayCorrectAnswerEn').textContent = 
    `${correctInfo.nameMajorEn} / ${correctInfo.nameMinorEn}`;
  $('#displayCorrectAnswerDe').textContent = 
    `${correctInfo.nameMajorDe} / ${correctInfo.nameMinorDe}`;

  // 正解譜面描画
  const correctXml = baseMeiTemplate.replace('##KEY_SIG##', state.correct);
  renderVerovio('answer-viewer', correctXml);

  // パネル切り替え
  hide($('#question-s2n'));
  show($('#answer-s2n'));
}

/**
 * 新しい問題を生成して質問パネルを初期化
 */
export function generateSig2NameQuestion() {
  // 通知リセット
  hideNotification($('#submit-notification'));
  hideNotification($('#new-question-notification'));

  // 状態リセット＆正解をランダム設定
  state.userMajor = '';
  state.userMinor = '';
  state.correct = keySignatures[
    Math.floor(Math.random() * keySignatures.length)
  ].meiValue;

  // ラジオのチェック解除
  $all('input[name="majorKey"]').forEach(r => r.checked = false);
  $all('input[name="minorKey"]').forEach(r => r.checked = false);

  // ボタン無効化＆ステータス更新
  $('#submitAnswerBtn').disabled = true;
  $('#question-status').textContent = '譜例の調号を見て調名を答えましょう。';

  // 質問パネル表示
  show($('#question-s2n'));
  hide($('#answer-s2n'));

  // 質問描画
  renderQuestion();
}

/**
 * 調号→調名モードの初期化
 * - 各種ボタン・ラジオへのイベントバインド
 * - 初回問題の自動生成
 */
export function initSig2Name() {
  const majorGrid = $('#major-key-grid');
  const minorGrid = $('#minor-key-grid');
  const submitBtn = $('#submitAnswerBtn');
  const genBtn    = $('#generate-new-question-btn');

  // 長調ラジオ変更
  majorGrid.addEventListener('change', e => {
    const target = /** @type {HTMLInputElement} */ (e.target);
    if (target.name === 'majorKey') {
      state.userMajor = target.value;
      submitBtn.disabled = !(state.userMajor && state.userMinor);
    }
  });

  // 短調ラジオ変更
  minorGrid.addEventListener('change', e => {
    const target = /** @type {HTMLInputElement} */ (e.target);
    if (target.name === 'minorKey') {
      state.userMinor = target.value;
      submitBtn.disabled = !(state.userMajor && state.userMinor);
    }
  });

  // 解答送信ボタン
  submitBtn.addEventListener('click', () => {
    showNotification($('#submit-notification'), '送信完了！');
    renderAnswer();
  });

  // 新しい問題生成ボタン
  genBtn.addEventListener('click', () => {
    generateSig2NameQuestion();
    showNotification($('#new-question-notification'), '新しい問題が生成されました！');
    // sig2name タブに戻す（必要に応じて）
    document.getElementById('tab-btn-sig2name')?.click();
  });

  // 初回問題生成
  generateSig2NameQuestion();
}
