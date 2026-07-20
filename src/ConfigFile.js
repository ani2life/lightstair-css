import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { DEFAULT_CONFIG_PATH } from './constants.js';

/**
 * 설정 파일을 읽고 기본값과 병합하여 완성된 설정 객체를 반환합니다.
 */
export class ConfigFile {
    #configPath;
    #defaultConfig;

    /**
     * @param {string} configPath - 사용자 설정 파일 절대 경로
     */
    constructor(configPath) {
        this.#configPath = configPath;
        // 기본 설정은 한 번만 읽어서 캐시 (인스턴스당 1회)
        const defaultRaw = readFileSync(DEFAULT_CONFIG_PATH, 'utf-8');
        this.#defaultConfig = parse(defaultRaw);
    }

    /**
     * 설정 파일을 읽고 기본값과 병합하여 반환합니다.
     * @returns {object} 기본값이 모두 채워진 설정 객체
     */
    read() {
        const raw = readFileSync(this.#configPath, 'utf-8');
        const userConfig = parse(raw);
        const config = Object.assign({}, this.#defaultConfig, userConfig);
        return config;
    }
}
