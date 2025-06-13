// verovio-loader.mjs
import { loadScript } from './library-loader.mjs';

/**
 * Verovioをロードします。
 * @returns {Promise<void>}
 */
export function loadVerovio() {
    return loadScript('Verovio', 'https://www.verovio.org/javascript/latest/verovio-toolkit-wasm.js');
}