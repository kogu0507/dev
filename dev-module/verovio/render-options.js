// module/verovio/render-options.js

/**
 * @typedef {Object} RenderOptions
 * @property {boolean} svgViewBox          - viewBox 属性を有効にするかどうか
 * @property {boolean} adjustPageHeight    - ページ高さを自動調整するか
 * @property {boolean} adjustPageWidth     - ページ幅を自動調整するか
 * @property {'encoded'|'line'|'none'} breaks - 改行設定
 * @property {number} [scale]              - 拡大縮小率（百分率）
 * @property {number} [spacingStaff]       - 五線間隔（px）
 * @property {number} [spacingSystem]      - スタッフグループ間隔（px）
 * @property {'none'|'page'} [footer]      - フッター表示設定
 * @property {number} [pageWidth]          - ページ幅（px）
 * @property {number} [pageMarginTop]      - ページ余白 上（px）
 * @property {number} [pageMarginRight]    - ページ余白 右（px）
 * @property {number} [pageMarginBottom]   - ページ余白 下（px）
 * @property {number} [pageMarginLeft]     - ページ余白 左（px）
 */

/**
 * 共通ベースオプション。
 * 各プリセットはこの設定を拡張します。
 * @type {RenderOptions}
 */
const baseOptions = {
  svgViewBox: false,
  adjustPageHeight: true,
  adjustPageWidth: true,
  breaks: 'encoded',
  spacingStaff: 5,
  spacingSystem: 15,
  footer: 'none',
};

/**
 * 標準（デフォルト）レンダリングオプション
 * @type {RenderOptions}
 */
export const defaultOptions = {
  ...baseOptions,
  scale: 50,
};

/**
 * 高解像度表示向けオプション
 * @type {RenderOptions}
 */
export const highResOptions = {
  ...baseOptions,
  scale: 150,
};

/**
 * モバイル表示向けオプション
 * @type {RenderOptions}
 */
export const mobileOptions = {
  ...baseOptions,
  scale: 40,
};

/**
 * 印刷向けレンダリングオプション
 * @type {RenderOptions}
 */
export const printOptions = {
  ...baseOptions,
  pageWidth: 1000,
  scale: 100,
};

/**
 * SVG viewBox 有効化オプション（余白すべて 0）
 * @type {RenderOptions}
 */
export const svgViewBox = {
  ...baseOptions,
  svgViewBox: true,
  pageMarginTop: 0,
  pageMarginRight: 0,
  pageMarginBottom: 0,
  pageMarginLeft: 0,
};
