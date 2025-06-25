// utils/dom.js

/**
 * 短縮セレクタ
 * @param {string} sel - CSSセレクタ
 * @returns {Element|null}
 */
export function $(sel) {
  return document.querySelector(sel);
}

/**
 * 複数要素取得
 * @param {string} sel - CSSセレクタ
 * @returns {Element[]}
 */
export function $all(sel) {
  return Array.from(document.querySelectorAll(sel));
}

/**
 * 要素を表示
 * @param {Element} el
 */
export function show(el) {
  el.classList.remove('hidden');
}

/**
 * 要素を非表示
 * @param {Element} el
 */
export function hide(el) {
  el.classList.add('hidden');
}
