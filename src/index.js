import { ConfigFile } from './ConfigFile.js';

/**
 * 설정 파일과 기본값을 조합해 완성된 설정 객체를 반환합니다.
 * @param {string} configPath - 설정 파일 경로
 * @returns {object} 기본값이 모두 채워진 설정 객체
 */
export function buildConfig(configPath) {
    const config = new ConfigFile(configPath);
    return config.read();
}

export { generateCSS, generateBakedCSS, generateColorVars } from './generator.js';
