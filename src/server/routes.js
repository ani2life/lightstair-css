import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateCSS, generateColorVars } from '../generator.js';
import { PREVIEW_DIR } from '../constants.js';

/**
 * 엔드포인트 핸들러 객체를 생성합니다.
 * @returns {object} 핸들러 함수들
 */
export function createRouter() {
    /** @param {import('node:http').ServerResponse} res */
    function handleIndex(res) {
        const htmlPath = join(PREVIEW_DIR, 'index.html');
        const htmlContent = readFileSync(htmlPath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(htmlContent);
    }

    /**
     * @param {object} config - 빌드된 설정 객체
     * @param {import('node:http').ServerResponse} res
     */
    function handleCSS(config, res) {
        try {
            const css = generateCSS(config, { isPreview: true });
            res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
            res.end(css, 'utf-8');
        } catch (err) {
            console.error(`[Error] CSS generation failed`);
            console.error(err.message);
            res.writeHead(500);
            res.end(`Error: ${err.message}`, 'utf-8');
        }
    }

    /**
     * @param {object} config - 빌드된 설정 객체
     * @param {import('node:http').ServerResponse} res
     */
    function handleConfig(config, res) {
        try {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(config), 'utf-8');
        } catch (err) {
            console.error(`[Error] Config serialization failed`);
            console.error(err.message);
            res.writeHead(500);
            res.end(`Error: ${err.message}`, 'utf-8');
        }
    }

    /**
     * @param {object} config - 빌드된 설정 객체
     * @param {import('node:http').ServerResponse} res
     */
    function handleColorVars(config, res) {
        try {
            const colorVars = generateColorVars(config);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(colorVars), 'utf-8');
        } catch (err) {
            console.error(`[Error] Variables generation failed`);
            console.error(err.message);
            res.writeHead(500);
            res.end(`Error: ${err.message}`, 'utf-8');
        }
    }

    /**
     * @param {string} url - 요청 URL (예: /icon-light.svg)
     * @param {import('node:http').ServerResponse} res
     */
    function handleStatic(url, res) {
        const filePath = join(PREVIEW_DIR, url.replace(/^\//, ''));
        const contentType = url.endsWith('.svg')
            ? 'image/svg+xml'
            : 'image/x-icon';
        try {
            const content = readFileSync(filePath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        } catch {
            res.writeHead(404);
            res.end('Not Found');
        }
    }

    return { handleIndex, handleCSS, handleConfig, handleColorVars, handleStatic };
}
