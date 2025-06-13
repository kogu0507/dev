// tonejs-loader.mjs
import { loadScript } from './library-loader.mjs';

/**
 * Tone.jsをロードします。
 * @returns {Promise<void>}
 */
export function loadToneJs() {
    return loadScript('Tone.js', 'https://unpkg.com/tone@14.7.77/build/Tone.js');
}