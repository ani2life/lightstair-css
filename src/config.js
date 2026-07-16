import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { DEFAULT_CONFIG_PATH } from './constants.js';

/**
 * 설정 파일과 기본값을 조합해 완성된 설정 객체를 반환합니다.
 * @param {string} configPath - 설정 파일 경로
 * @returns {object} 기본값이 모두 채워진 설정 객체
 */
export function buildConfig(configPath) {
    const raw = readFileSync(configPath, 'utf-8');
    const userConfig = parse(raw);

    const defaultRaw = readFileSync(DEFAULT_CONFIG_PATH, 'utf-8');
    const defaultConfig = parse(defaultRaw);

    const config = Object.assign({}, defaultConfig, userConfig);
    return config;
}
