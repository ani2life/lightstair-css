import { ConfigFile } from './ConfigFile.js';

/** @typedef {import('./types.js').LightstairConfig} LightstairConfig */
/** @typedef {import('./types.js').ColorVars} ColorVars */
/** @typedef {import('./types.js').ColorValue} ColorValue */
/** @typedef {import('./types.js').ColorFormat} ColorFormat */

/**
 * 설정 파일과 기본값을 조합해 완성된 설정 객체를 반환합니다.
 * @param {string} configPath - 설정 파일 경로
 * @returns {LightstairConfig} 기본값이 모두 채워진 설정 객체
 */
export function buildConfig(configPath) {
    const config = new ConfigFile(configPath);
    return config.read();
}

export { generateCSS, generateBakedCSS, generateColorVars } from './generator.js';
