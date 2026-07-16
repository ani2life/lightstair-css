import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SRC_DIR, DEFAULT_CONFIG_FILE, DEFAULT_CONFIG_PATH } from './constants.js';
import http from 'node:http';
import { Command, Option } from 'commander';
import { parse } from 'yaml';
import { buildConfig } from './config.js';
import { generateCSS, generateBakedCSS, generateColorVars } from './generator.js';

const program = new Command();
const configOption = new Option('-c, --config <path>', 'path to configuration file');

/**
 * 설정 파일이 존재하는지 확인하고, 없으면 기본 설정 파일을 복사합니다.
 * @param {string} configPath - 설정 파일 대상 경로
 * @param {object} [options] - 옵션 객체
 * @param {boolean} [options.suppressIfExists=false] - 파일 존재 시 로그 출력 억제 여부
 */
function ensureConfigFile(configPath, { suppressIfExists = false } = {}) {
    const targetPath = resolve(configPath);
    if (existsSync(targetPath)) {
        if (!suppressIfExists) console.log(`[OK] Config already exists: ${targetPath}`);
        return;
    }
    copyFileSync(DEFAULT_CONFIG_PATH, targetPath);
    console.log(`[OK] Created: ${targetPath}`);
}

/**
 * 옵션에서 설정 파일 경로를 해석하고, 기본 경로인 경우 파일을 생성합니다.
 * @param {object} options - CLI 옵션 객체
 * @param {string} [options.config] - 설정 파일 경로 (선택사항)
 * @param {object} [options] - 옵션 객체
 * @param {boolean} [options.suppressIfExists=true] - 파일 존재 시 로그 출력 억제 여부
 * @returns {string} 해석된 설정 파일의 절대 경로
 */
function resolveAndEnsureConfigFile(options, { suppressIfExists = true } = {}) {
    const configPath = options.config === undefined
        ? resolve(process.cwd(), DEFAULT_CONFIG_FILE)
        : resolve(options.config);

    if (options.config === undefined) {
        ensureConfigFile(configPath, { suppressIfExists });
    }

    return configPath;
}

program
    .name('lightstair-css')
    .description('LightStair CSS CLI tool for generating color values')
    .version('0.1.0')
    .addOption(configOption)
    .option('-o, --output <path>', 'output CSS file path', 'lightstair-css.css')
    .option('--bake [format]', 'bake CSS variables into computed values (oklch, rgb, hex)')
    .action(() => {
        const options = program.opts();
        const configPath = resolveAndEnsureConfigFile(options, { suppressIfExists: true });

        const outputPath = resolve(options.output);
        const bakeFormat = (() => {
            if (options.bake === undefined) return null;
            if (options.bake === true) return 'oklch';
            return options.bake;
        })();

        try {
            const config = buildConfig(configPath);

            const css = bakeFormat
                ? generateBakedCSS(config, bakeFormat)
                : generateCSS(config);

            const outputDir = dirname(outputPath);
            mkdirSync(outputDir, { recursive: true });
            writeFileSync(outputPath, css, 'utf-8');
            console.log(`[OK] Output written to: ${outputPath}`);
        } catch (err) {
            console.error(`[Error] Failed to process config: ${configPath}`);
            console.error(err.message);
            process.exit(1);
        }
    });

program.command('init').description('create a default lightstair-css.yml config file').action(() => {
    const targetPath = resolve(process.cwd(), DEFAULT_CONFIG_FILE);
    ensureConfigFile(targetPath, { suppressIfExists: false });
    process.exit(0);
});

program
    .command('preview')
    .description('run the preview server')
    .addOption(configOption)
    .option('-p, --port <number>', 'port number to use (default: random)')
    .action((options) => {
        const configPath = resolveAndEnsureConfigFile(options, { suppressIfExists: true });

        const port = options.port !== undefined
            ? parseInt(options.port, 10)
            : 0;

        if (port !== 0 && (isNaN(port) || port < 1 || port > 65535)) {
            console.error('[Error] Invalid port number. Must be 1-65535.');
            process.exit(1);
        }

        const server = http.createServer((req, res) => {
            if (req.url === '/') {
                const htmlPath = resolve(SRC_DIR, '..', 'preview', 'index.html');
                const htmlContent = readFileSync(htmlPath, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(htmlContent);
                return;
            }

            if (req.url === '/css') {
                try {
                    const config = buildConfig(configPath);
                    const css = generateCSS(config, { isPreview: true });
                    res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
                    res.end(css, 'utf-8');
                } catch (err) {
                    console.error(`[Error] CSS generation failed: ${configPath}`);
                    console.error(err.message);
                    res.writeHead(500);
                    res.end(`Error: ${err.message}`, 'utf-8');
                }
                return;
            }

            if (req.url === '/config') {
                try {
                    const config = buildConfig(configPath);
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(config), 'utf-8');
                } catch (err) {
                    console.error(`[Error] Config load failed: ${configPath}`);
                    console.error(err.message);
                    res.writeHead(500);
                    res.end(`Error: ${err.message}`, 'utf-8');
                }
                return;
            }

            if (req.url === '/color-vars') {
                try {
                    const config = buildConfig(configPath);
                    const colorVars = generateColorVars(config);
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(colorVars), 'utf-8');
                } catch (err) {
                    console.error(`[Error] Variables generation failed: ${configPath}`);
                    console.error(err.message);
                    res.writeHead(500);
                    res.end(`Error: ${err.message}`, 'utf-8');
                }
                return;
            }

            if (req.url.endsWith('.svg') || req.url.endsWith('.ico')) {
                const filePath = join(SRC_DIR, '..', 'preview', req.url.replace(/^\//, ''));
                const contentType = req.url.endsWith('.svg')
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
                return;
            }

            res.writeHead(404);
            res.end('Not Found');
        });

        server.listen(port, () => {
            const actualPort = server.address().port;
            console.log(`[OK] Preview server running at http://localhost:${actualPort}`);
            console.log('Press Ctrl+C to stop the server.');
        });

        process.on('SIGINT', () => {
            console.log('\nShutting down preview server...');
            server.close();
            process.exit(0);
        });
    });

program.parse(process.argv);
