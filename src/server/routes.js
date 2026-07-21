import { readFileSync } from 'node:fs';
import { join, resolve, extname, sep } from 'node:path';
import { generatePreviewCSS, generateColorVars } from '../generator.js';
import { PREVIEW_DIR } from '../constants.js';

const STATIC_CONTENT_TYPES = {
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

/**
 * 정적 파일의 Content-Type을 결정합니다.
 * @param {string} filename
 * @returns {string}
 */
function getContentType(filename) {
    const dotExt = extname(filename);
    return STATIC_CONTENT_TYPES[dotExt] || 'application/octet-stream';
}

/**
 * 정적 파일을 읽어서 응답합니다.
 * @param {string} filePath
 * @param {import('node:http').ServerResponse} res
 */
function serveStaticFile(filePath, res) {
    try {
        const content = readFileSync(filePath);
        const contentType = getContentType(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch {
        console.error(`[Error] Static file not found: ${filePath}`);
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
    }
}

/**
 * 라우터 인스턴스를 생성합니다.
 * @returns {{
 *   handle: (
 *     req: import('node:http').IncomingMessage,
 *     res: import('node:http').ServerResponse,
 *     config: object
 *   ) => void
 * }}
 */
export function createRouter() {
    return {
        /**
         * 요청을 처리합니다.
         * @param {import('node:http').IncomingMessage} req
         * @param {import('node:http').ServerResponse} res
         * @param {object} config - 빌드된 설정 객체
         */
        handle(req, res, config) {
            const configMissing = () => {
                if (!config) {
                    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end('Error: Config not provided', 'utf-8');
                    return true;
                }
                return false;
            };

            const { url } = req;

            if (url === '/') {
                const htmlPath = join(PREVIEW_DIR, 'index.html');
                const htmlContent = readFileSync(htmlPath, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(htmlContent);
                return;
            }

            if (url === '/css') {
                if (configMissing()) return;
                try {
                    const css = generatePreviewCSS(config);
                    res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
                    res.end(css, 'utf-8');
                } catch (err) {
                    console.error('[Error] CSS generation failed:', err.message);
                    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end(`Error: ${err.message}`, 'utf-8');
                }
                return;
            }

            if (url === '/config') {
                if (configMissing()) return;
                try {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(config), 'utf-8');
                } catch (err) {
                    console.error('[Error] Config serialization failed:', err.message);
                    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end(`Error: ${err.message}`, 'utf-8');
                }
                return;
            }

            if (url === '/color-vars') {
                if (configMissing()) return;
                try {
                    const colorVars = generateColorVars(config);
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(colorVars), 'utf-8');
                } catch (err) {
                    console.error('[Error] Variables generation failed:', err.message);
                    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end(`Error: ${err.message}`, 'utf-8');
                }
                return;
            }

            // 정적 파일
            const staticPathname = url.replace(/^\//, '');
            const staticExt = extname(staticPathname);
            if (STATIC_CONTENT_TYPES[staticExt]) {
                const resolvedPath = join(PREVIEW_DIR, staticPathname);
                const normalizedPath = resolve(resolvedPath);
                if (!normalizedPath.startsWith(PREVIEW_DIR + sep)) {
                    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end('Forbidden');
                    return;
                }
                serveStaticFile(normalizedPath, res);
                return;
            }

            // 404
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not Found');
        },
    };
}
