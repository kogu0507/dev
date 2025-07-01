// dev-module/verovio/render-options.js

/**
 * 標準レンダリングオプションのプリセット集
 * 使いたいプリセットを import して CoreProcessor.setRenderOptions に渡します。
 * 例: import { defaultOptions } from './render-options.js';
 */

/**
 * 標準（デフォルト）のオプション
 */
export const defaultOptions = {
  pageWidth: 800,     // ページ幅（px）
  scale: 70,          // 拡大縮小率（％）
  adjustPageHeight: true,
  spacingStaff: 5,    // 五線間隔
  spacingSystem: 15,  // スタッフグループ間間隔
  footer: "none",
};

/**
 * 高解像度表示向けオプション
 */
export const highResOptions = {
  adjustPageHeight: true,
  adjustPageWidth: true,
  scale: 100,
  footer: "none",
  };

/**
 * モバイル表示向けオプション
 */
export const mobileOptions = {
  pageWidth: 480,
  scale: 60,
  adjustPageHeight: false,
  footer: "none",
};

/**
 * 印刷向けオプション
 */
export const printOptions = {
  pageWidth: 1000,
  scale: 100,
  pageHeight: 1400,
  adjustPageHeight: true,
};
