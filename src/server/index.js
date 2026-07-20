import http from 'node:http';
import chokidar from 'chokidar';
import { buildConfig } from '../config.js';
import { SSEManager } from './sse.js';
import { createRouter } from './routes.js';
import { PREVIEW_DIR } from '../constants.js';

/**
 * preview 서버를 생성하고 시작합니다.
 * @param {string} configPath - 설정 파일 절대 경로
 * @param {number} port - listening 포트 (0이면 임의 포트)
 * @returns {{ server: http.Server, watcher: chokidar.FSWatcher, sse: SSEManager }}
 */
export function createAndStartServer(configPath, port) {
    const sse = new SSEManager();
    const router = createRouter();

    const server = http.createServer((req, res) => {
        // config는 매 요청마다 재로드 (파일 변경 즉시 반영)
        const config = buildConfig(configPath);

        if (req.url === '/') {
            router.handleIndex(res);
        } else if (req.url === '/css') {
            router.handleCSS(config, res);
        } else if (req.url === '/config') {
            router.handleConfig(config, res);
        } else if (req.url === '/color-vars') {
            router.handleColorVars(config, res);
        } else if (req.url === '/sse') {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            });
            sse.add(res);
        } else if (req.url.endsWith('.svg') || req.url.endsWith('.ico')) {
            router.handleStatic(req.url, res);
        } else {
            res.writeHead(404);
            res.end('Not Found');
        }
    });

    server.listen(port, () => {
        const actualPort = server.address().port;
        console.log(`[OK] Preview server running at http://localhost:${actualPort}`);
        console.log('Press Ctrl+C to stop the server.');
    });

    // 설정 파일 변경 감지 (chokidar: atomic save 중복 이벤트 정규화)
    const watcher = chokidar.watch(configPath, {
        awaitWriteFinish: {
            stabilityThreshold: 300,
            pollInterval: 100,
        },
    });
    watcher.on('change', () => {
        sse.broadcast('reload', 'Config changed.');
    });

    return { server, watcher, sse };
}
