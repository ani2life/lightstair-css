import Color from 'colorjs.io';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { beautify } from '@toolsnap/css-minifier-tool';
import { SRC_DIR, DEFAULT_CONFIG_PATH } from './constants.js';

/**
 * 설정 파일과 기본값을 조합해 완성된 설정 객체를 반환합니다.
 * @param {string} configPath - 설정 파일 경로
 * @returns {object} 기본값이 모두 채워진 설정 객체
 */
export function buildConfig(configPath) {
    const raw = readFileSync(configPath, 'utf-8');
    const userConfig = parse(raw);

    const defaultRaw = readFileSync(DEFAULT_CONFIG_PATH, 'utf-8');
    const defaultConfig = parse(defaultRaw);

    const config = Object.assign({}, defaultConfig, userConfig);
    return config;
}

/**
 * 설정 객체를 기반으로 CSS 변수 문자열을 생성합니다.
 * @param {object} config - 설정 객체
 * @param {object} [options] - 옵션 객체
 * @param {boolean} [options.isPreview=false] - 미리보기 모드 여부
 * @returns {string} 생성된 CSS 문자열
 */
export function generateCSS(config, { isPreview = false } = {}) {
    const {
        tx_base_c, tx_base_h,
        bg_base_c, bg_base_h,
        bd_base_c, bd_base_h,
        tx_init_l, bg_init_l, bd_init_l,
        dark_tx_init_l, dark_bg_init_l, dark_bd_init_l,
        tx_l_gap, bg_l_gap, bd_l_gap,
        dark_tx_l_gap, dark_bg_l_gap, dark_bd_l_gap,
        tx_l_steps, bg_l_steps, bd_l_steps,
        tx_prefix, bg_prefix, bd_prefix,
    } = config;

    function generateSteps(prefix, steps) {
        const initL = `var(--${prefix}-init-l)`;
        const lGap = `var(--${prefix}-l-gap)`;
        const baseC = `var(--${prefix}-base-c)`;
        const baseH = `var(--${prefix}-base-h)`;

        return Array.from({ length: steps }, (_, i) => {
            const calcL = `clamp(0, ${initL} + ${lGap} * ${i}, 1)`;
            return `--${prefix}-${i + 1}: oklch(${calcL} ${baseC} ${baseH});`
        }).join('\n');
    }

    const txStepsCss = generateSteps(tx_prefix, tx_l_steps);
    const bgStepsCss = generateSteps(bg_prefix, bg_l_steps);
    const bdStepsCss = generateSteps(bd_prefix, bd_l_steps);

    const baseCss = `
        --${tx_prefix}-base-c: ${tx_base_c};
        --${tx_prefix}-base-h: ${tx_base_h};
        --${bg_prefix}-base-c: ${bg_base_c};
        --${bg_prefix}-base-h: ${bg_base_h};
        --${bd_prefix}-base-c: ${bd_base_c};
        --${bd_prefix}-base-h: ${bd_base_h};
    `;

    const lightThemeCss = `
        --${tx_prefix}-init-l: ${tx_init_l};
        --${bg_prefix}-init-l: ${bg_init_l};
        --${bd_prefix}-init-l: ${bd_init_l};

        --${tx_prefix}-l-gap: ${tx_l_gap};
        --${bg_prefix}-l-gap: ${bg_l_gap};
        --${bd_prefix}-l-gap: ${bd_l_gap};
    `;

    const darkThemeCss = `
        --${tx_prefix}-init-l: ${dark_tx_init_l};
        --${bg_prefix}-init-l: ${dark_bg_init_l};
        --${bd_prefix}-init-l: ${dark_bd_init_l};

        --${tx_prefix}-l-gap: ${dark_tx_l_gap};
        --${bg_prefix}-l-gap: ${dark_bg_l_gap};
        --${bd_prefix}-l-gap: ${dark_bd_l_gap};
    `;

    if (isPreview) {
        const {
            preview_tx_l, preview_tx_c, preview_tx_h,
            preview_bg_l, preview_bg_c, preview_bg_h,
            dark_preview_tx_l, dark_preview_tx_c, dark_preview_tx_h,
            dark_preview_bg_l, dark_preview_bg_c, dark_preview_bg_h,
        } = config;

        const previewColorVars = `
            --preview-tx-color: oklch(${preview_tx_l} ${preview_tx_c} ${preview_tx_h});
            --preview-bg-color: oklch(${preview_bg_l} ${preview_bg_c} ${preview_bg_h});
            --dark-preview-tx-color: oklch(${dark_preview_tx_l} ${dark_preview_tx_c} ${dark_preview_tx_h});
            --dark-preview-bg-color: oklch(${dark_preview_bg_l} ${dark_preview_bg_c} ${dark_preview_bg_h});
        `;

        return beautifyCss(/* css */`
            :root {
                ${previewColorVars}

                ${baseCss}
            }

            .light-theme,
            .dark-theme {
                ${txStepsCss}
                ${bgStepsCss}
                ${bdStepsCss}
            }

            .light-theme {
                color-scheme: light;
                ${lightThemeCss}
            }

            .dark-theme {
                color-scheme: dark;
                ${darkThemeCss}
            }
        `);
    } else {
        return beautifyCss(/* css */`
            :root {
                ${baseCss}

                ${lightThemeCss}

                @media (prefers-color-scheme: dark) {
                    ${darkThemeCss}
                }

                ${txStepsCss}
                ${bgStepsCss}
                ${bdStepsCss}
            }
        `);
    }
}

/**
 * 설정 객체를 기반으로 bake된 CSS 변수 문자열을 생성합니다.
 * 실제 색상 값(oklch/rgb/hex)이 이미 계산되어 포함된 CSS를 반환합니다.
 * @param {object} config - 설정 객체
 * @param {('oklch' | 'rgb' | 'hex')} format - 색상 포맷
 * @returns {string} 생성된 CSS 문자열
 */
export function generateBakedCSS(config, format) {
    const {
        tx_base_c, tx_base_h,
        bg_base_c, bg_base_h,
        bd_base_c, bd_base_h,
        tx_init_l, bg_init_l, bd_init_l,
        dark_tx_init_l, dark_bg_init_l, dark_bd_init_l,
        tx_l_gap, bg_l_gap, bd_l_gap,
        dark_tx_l_gap, dark_bg_l_gap, dark_bd_l_gap,
        tx_l_steps, bg_l_steps, bd_l_steps,
        tx_prefix, bg_prefix, bd_prefix,
    } = config;

    function generateSteps(prefix, initL, gap, steps, c, h, format) {
        return Array.from({ length: steps }, (_, i) => {
            const l = clamp(0, initL + gap * i, 1);
            return `--${prefix}-${i + 1}: ${formatColor(l, c, h)[format]};`;
        }).join('\n');
    }

    const txSteps = generateSteps(tx_prefix, tx_init_l, tx_l_gap, tx_l_steps, tx_base_c, tx_base_h, format);
    const bgSteps = generateSteps(bg_prefix, bg_init_l, bg_l_gap, bg_l_steps, bg_base_c, bg_base_h, format);
    const bdSteps = generateSteps(bd_prefix, bd_init_l, bd_l_gap, bd_l_steps, bd_base_c, bd_base_h, format);

    const txStepsDark = generateSteps(tx_prefix, dark_tx_init_l, dark_tx_l_gap, tx_l_steps, tx_base_c, tx_base_h, format);
    const bgStepsDark = generateSteps(bg_prefix, dark_bg_init_l, dark_bg_l_gap, bg_l_steps, bg_base_c, bg_base_h, format);
    const bdStepsDark = generateSteps(bd_prefix, dark_bd_init_l, dark_bd_l_gap, bd_l_steps, bd_base_c, bd_base_h, format);

    return beautifyCss(/* css */`
        :root {
            ${txSteps}
            ${bgSteps}
            ${bdSteps}

            @media (prefers-color-scheme: dark) {
                ${txStepsDark}
                ${bgStepsDark}
                ${bdStepsDark}
            }
        }
    `);
}

/**
 * 설정 객체를 기반으로 색상 변수 객체를 생성합니다.
 * 라이트/다크 테마별 색상 값을 포함하는 중첩 객체를 반환합니다.
 * @param {object} config - 설정 객체
 * @returns {object} 색상 변수를 담은 객체 (키: CSS 변수명, 값: { light, dark } 색상 정보)
 */
export function generateColorVars(config) {
    const {
        tx_base_c, tx_base_h,
        bg_base_c, bg_base_h,
        bd_base_c, bd_base_h,
        tx_init_l, bg_init_l, bd_init_l,
        dark_tx_init_l, dark_bg_init_l, dark_bd_init_l,
        tx_l_gap, bg_l_gap, bd_l_gap,
        dark_tx_l_gap, dark_bg_l_gap, dark_bd_l_gap,
        tx_l_steps, bg_l_steps, bd_l_steps,
        tx_prefix, bg_prefix, bd_prefix,
    } = config;

    const result = {};

    function addSteps(prefix, lightInitL, lightGap, darkInitL, darkGap, steps, c, h) {
        for (let i = 0; i < steps; i++) {
            const key = `--${prefix}-${i + 1}`;
            const lightL = clamp(0, lightInitL + lightGap * i, 1);
            const darkL = clamp(0, darkInitL + darkGap * i, 1);

            result[key] = {
                light: formatColor(lightL, c, h),
                dark: formatColor(darkL, c, h),
            };
        }
    }

    addSteps(tx_prefix, tx_init_l, tx_l_gap, dark_tx_init_l, dark_tx_l_gap, tx_l_steps, tx_base_c, tx_base_h);
    addSteps(bg_prefix, bg_init_l, bg_l_gap, dark_bg_init_l, dark_bg_l_gap, bg_l_steps, bg_base_c, bg_base_h);
    addSteps(bd_prefix, bd_init_l, bd_l_gap, dark_bd_init_l, dark_bd_l_gap, bd_l_steps, bd_base_c, bd_base_h);

    return result;
}

/**
 * CSS 문자열을 보기 좋게 포맷팅합니다.
 * @param {string} css - 포맷팅할 CSS 문자열
 * @returns {string} 포맷팅된 CSS 문자열
 */
function beautifyCss(css) {
    return beautify(css)
        // 시작 공백을 제외한 중간 공백을 1개로 치환.
        .replace(/(?<=\S)[ ]{2,}/g, ' ');
}

/**
 * 값을 최소값과 최대값 사이로 제한합니다.
 * @param {number} min - 최소값
 * @param {number} val - 제한할 값
 * @param {number} max - 최대값
 * @returns {number} 제한된 값
 */
function clamp(min, val, max) {
    return Math.max(min, Math.min(val, max));
}

/**
 * OKLCH 색상을 oklch, rgb, hex 형식으로 변환합니다.
 * @param {number} l - 밝기 (Lightness)
 * @param {number} c - 채도 (Chroma)
 * @param {number} h - 색상 (Hue)
 * @returns {{ oklch: string, rgb: string, hex: string }} 각 형식으로 포맷된 색상 문자열
 */
function formatColor(l, c, h) {
    const color = new Color({ spaceId: 'oklch', coords: [l, c, h] });
    return {
        oklch: color.toString({
            format: 'oklch',
            coords: ['<number>', '<number>', '<number>']
        }),
        rgb: color.toString({
            format: 'rgb',
            coords: ['<number>[0, 255]', '<number>[0, 255]', '<number>[0, 255]']
        }),
        hex: color.toString({ format: 'hex' }),
    };
}
