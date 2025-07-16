// module/tonejs/loader.js
// import { loadScript } from '../library-loader.js'; // 開発用
import { loadScript } from '../library-loader.min.js'; // 開発用
//import { loadScript } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@バージョン/library-loader.min.js'; // 本番用

/**
 * Tone.jsをロードします。
 * @returns {Promise<void>}
 */
export function loadToneJs() {
    //return loadScript('Tone.js', 'https://unpkg.com/tone@14.7.77/build/Tone.js');
    return loadScript('Tone.js', 'https://unpkg.com/tone@15.1.22/build/Tone.js');
}