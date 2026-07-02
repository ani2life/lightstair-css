import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { Command, Option } from 'commander';
import { parse } from 'yaml';
import { beautify } from '@toolsnap/css-minifier-tool';
import open from 'open';
import { generateCSS, generateBakedCSS } from './generator.js';

const SRC_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG_FILE = 'lightstair-css.yml';
const DEFAULT_CONFIG_PATH = resolve(SRC_DIR, '..', 'templates', DEFAULT_CONFIG_FILE);

const program = new Command();
const configOption = new Option('-c, --config <path>', 'path to configuration file');

function loadConfig(configPath) {
    const raw = readFileSync(configPath, 'utf-8');
    const userConfig = parse(raw);

    const defaultRaw = readFileSync(DEFAULT_CONFIG_PATH, 'utf-8');
    const defaultConfig = parse(defaultRaw);

    const config = Object.assign({}, defaultConfig, userConfig);
    return config;
}

function ensureConfigFile(configPath, { suppressIfExists = false } = {}) {
    const targetPath = resolve(configPath);
    if (existsSync(targetPath)) {
        if (!suppressIfExists) console.log(`[OK] Config already exists: ${targetPath}`);
        return;
    }
    copyFileSync(DEFAULT_CONFIG_PATH, targetPath);
    console.log(`[OK] Created: ${targetPath}`);
}

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
            const config = loadConfig(configPath);

            const css = bakeFormat
                ? beautify(generateBakedCSS(config, bakeFormat))
                : beautify(generateCSS(config));

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
    .description('open preview page in browser')
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
                    const config = loadConfig(configPath);
                    const css = beautify(generateCSS(config));
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
                    const config = loadConfig(configPath);
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

            res.writeHead(404);
            res.end('Not Found');
        });

        server.listen(port, () => {
            const actualPort = server.address().port;
            console.log(`[OK] Preview server running at http://localhost:${actualPort}`);
            console.log('Press Ctrl+C to stop the server.');
            open(`http://localhost:${actualPort}`);
        });

        process.on('SIGINT', () => {
            console.log('\nShutting down preview server...');
            server.close();
            process.exit(0);
        });
    });

program.parse(process.argv);
