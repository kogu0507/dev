// utils/notification.js
import { show, hide } from './dom.js';

/**
 * 通知メッセージを表示
 * @param {HTMLElement} el - 通知用要素
 * @param {string} message - 表示メッセージ
 */
export function showNotification(el, message) {
  if (!el) return;
  // テキスト更新
  el.textContent = message;
  // ARIA 属性でアクセシビリティ対応
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  // hidden クラスを外して表示
  show(el);
}

/**
 * 通知メッセージを非表示
 * @param {HTMLElement} el - 通知用要素
 */
export function hideNotification(el) {
  if (!el) return;
  // 隠すだけでなく内容もクリア
  hide(el);
  el.textContent = '';
}
