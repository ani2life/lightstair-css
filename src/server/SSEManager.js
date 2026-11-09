/**
 * SSE(Server-Sent Events) 연결 관리 및 브로드캐스트
 */
export class SSEManager {
    /** @type {Map<import('node:http').ServerResponse, NodeJS.Timeout>} */
    #heartbeats = new Map();
    /** @type {Set<import('node:http').ServerResponse>} */
    #clients = new Set();

    /**
     * 새 SSE 클라이언트를 추가합니다.
     * @param {import('node:http').ServerResponse} res - 응답 객체
     */
    add(res) {
        this.#clients.add(res);
        this.#heartbeats.set(res, setInterval(() => {
            if (!res.writableEnded) res.write(': heartbeat\n\n');
        }, 30000));
        res.on('close', () => this.remove(res));
    }

    /**
     * SSE 클라이언트를 제거합니다.
     * 하트비트 타이머를 정리하고, 종료되지 않은 응답 스트림을 종료합니다.
     * @param {import('node:http').ServerResponse} res - 응답 객체
     */
    remove(res) {
        clearInterval(this.#heartbeats.get(res));
        this.#heartbeats.delete(res);
        this.#clients.delete(res);
        if (!res.writableEnded) res.end();
    }

    /**
     * 모든 클라이언트에 이벤트를 브로드캐스트합니다.
     * @param {string} event - 이벤트 이름
     * @param {string|object} data - 전송할 데이터
     */
    broadcast(event, data) {
        const chunk = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const res of this.#clients) {
            if (!res.writableEnded) res.write(chunk);
        }
        for (const res of this.#clients) {
            if (res.writableEnded) this.remove(res);
        }
    }

    /**
     * 모든 클라이언트를 정리합니다.
     */
    cleanup() {
        for (const res of this.#clients) {
            this.remove(res);
        }
    }
}
