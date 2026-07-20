/**
 * SSE(Server-Sent Events) 연결 관리 및 브로드캐스트
 */

export class SSEManager {
    constructor() {
        this.clients = new Set();
    }

    /**
     * 새 SSE 클라이언트를 추가합니다.
     * @param {import('node:http').ServerResponse} res - 응답 객체
     */
    add(res) {
        this.clients.add(res);
        res.hbId = setInterval(() => {
            if (!res.writableEnded) res.write(': heartbeat\n\n');
        }, 30000);
        res.on('close', () => this.remove(res));
    }

    /**
     * SSE 클라이언트를 제거합니다.
     * @param {import('node:http').ServerResponse} res - 응답 객체
     */
    remove(res) {
        clearInterval(res.hbId);
        this.clients.delete(res);
    }

    /**
     * 모든 클라이언트에 이벤트를 브로드캐스트합니다.
     * @param {string} event - 이벤트 이름
     * @param {string|object} data - 전송할 데이터
     */
    broadcast(event, data) {
        const chunk = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const res of this.clients) {
            if (!res.writableEnded) res.write(chunk);
        }
        for (const res of this.clients) {
            if (res.writableEnded) this.clients.delete(res);
        }
    }

    /**
     * 모든 클라이언트를 정리합니다.
     */
    cleanup() {
        for (const res of this.clients) {
            clearInterval(res.hbId);
            if (!res.writableEnded) res.end();
        }
        this.clients.clear();
    }
}
