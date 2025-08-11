// tonejs/core/loader.js
import { loadScript } from '../../library-loader.mjs'; // library-loader.mjsへの相対パス

/**
 * Tone.jsをロードします。
 * @returns {Promise<void>}
 */
export function loadToneJs() {
    return loadScript('Tone.js', 'https://unpkg.com/tone@15.1.22/build/Tone.js');
}
