// utils/notification.js

/**
 * @param {Element} el - 通知表示用の要素
 * @param {string} message - 表示するメッセージ
 */
export function showNotification(el, message) {
  if (!el) return;
  el.textContent = message;
  el.style.display = 'block';
}

/**
 * @param {Element} el - 通知非表示用の要素
 */
export function hideNotification(el) {
  if (!el) return;
  el.style.display = 'none';
}
