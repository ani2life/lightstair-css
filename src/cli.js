import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_CONFIG_FILE, DEFAULT_CONFIG_PATH } from './constants.js';
import { Command, Option } from 'commander';
import { parse } from 'yaml';
import { buildConfig } from './config.js';
import { generateCSS, generateBakedCSS, generateColorVars } from './generator.js';
import { PreviewServer } from './server/PreviewServer.js';

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
    .action(async (options) => {
        const configPath = resolveAndEnsureConfigFile(options, { suppressIfExists: true });

        const port = options.port !== undefined
            ? parseInt(options.port, 10)
            : 0;

        if (port !== 0 && (isNaN(port) || port < 1 || port > 65535)) {
            console.error('[Error] Invalid port number. Must be 1-65535.');
            process.exit(1);
        }

        const previewServer = new PreviewServer(configPath, port);
        await previewServer.start();

        process.on('SIGINT', async () => {
            console.log('\nShutting down preview server...');
            await previewServer.stop();
            process.exit(0);
        });
    });

program.parse(process.argv);
