import http from 'node:http';
import chokidar from 'chokidar';
import { ConfigFile } from '../ConfigFile.js';
import { SSEManager } from './SSEManager.js';
import { createRouter } from './routes.js';

/**
 * 미리보기 서버를 생성하고 시작합니다.
 */
export class PreviewServer {
    #configPath;
    #config;
    #port;
    #sse;
    #router;
    #server;
    #watcher;

    /**
     * @param {string} configPath - 설정 파일 절대 경로
     * @param {number} port - listening 포트 (0이면 임의 포트)
     */
    constructor(configPath, port) {
        this.#configPath = configPath;
        this.#config = new ConfigFile(configPath);
        this.#port = port;
        this.#sse = new SSEManager();
        this.#router = createRouter();
        this.#server = null;
        this.#watcher = null;
    }

    /**
     * 서버를 시작합니다.
     * @returns {Promise<number>} 실제 할당된 포트
     */
    async start() {
        return new Promise((resolve, reject) => {
            this.#server = http.createServer((req, res) => {
                // SSE — 라우터 외부에서 별도 처리
                if (req.url === '/sse') {
                    res.writeHead(200, {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive',
                    });
                    this.#sse.add(res);
                    return;
                }

                // 설정 파일 실시간 반영을 위해 매 요청마다 재읽기
                const config = this.#config.read();
                this.#router.handle(req, res, config);
            });

            this.#watcher = chokidar.watch(this.#configPath, {
                awaitWriteFinish: {
                    stabilityThreshold: 300,
                    pollInterval: 100,
                },
            });

            this.#watcher.on('change', () => {
                this.#sse.broadcast('reload', 'Config changed.');
            });

            this.#server.listen(this.#port, () => {
                const actualPort = this.#server.address().port;
                console.log(`[OK] Preview server running at http://localhost:${actualPort}`);
                console.log('Press Ctrl+C to stop the server.');
                resolve(actualPort);
            });

            this.#server.on('error', reject);
        });
    }

    /**
     * 서버를 중지합니다.
     * @returns {Promise<void>}
     */
    async stop() {
        return new Promise((resolve) => {
            this.#sse.cleanup();
            this.#watcher?.close();

            if (this.#server) {
                this.#server.close(() => resolve());
            } else {
                resolve();
            }
        });
    }
}
