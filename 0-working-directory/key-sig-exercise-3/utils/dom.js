// utils/dom.js

/**
 * ID で要素を取得（存在チェック付き）
 * @param {string} id - 要素の ID
 * @returns {HTMLElement}
 */
export function getById(id) {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Element with ID "${id}" not found.`);
  }
  return el;
}

/**
 * CSS セレクタで要素を取得
 * @param {string} sel - CSS セレクタ
 * @returns {Element|null}
 */
export function $(sel) {
  return document.querySelector(sel);
}

/**
 * CSS セレクタで複数要素を取得
 * @param {string} sel - CSS セレクタ
 * @returns {Element[]}
 */
export function $all(sel) {
  return Array.from(document.querySelectorAll(sel));
}

/**
 * 要素を表示（.hidden クラスを外す）
 * @param {HTMLElement} el
 */
export function show(el) {
  el.classList.remove('hidden');
}

/**
 * 要素を非表示（.hidden クラスを付与）
 * @param {HTMLElement} el
 */
export function hide(el) {
  el.classList.add('hidden');
}
