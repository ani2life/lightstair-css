import Color from 'colorjs.io';

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

        return /* css */`
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
        `;
    } else {
        return /* css */`
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
        `;
    }
}

function clamp(min, val, max) {
    return Math.max(min, Math.min(val, max));
}

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

    function generateSteps(prefix, initL, gap, steps, c, h) {
        return Array.from({ length: steps }, (_, i) => {
            const l = clamp(0, initL + gap * i, 1);
            return `--${prefix}-${i + 1}: oklch(${l}, ${c}, ${h}});`;
        }).join('\n');
    }

    const txSteps = generateSteps(tx_prefix, tx_init_l, tx_l_gap, tx_l_steps, tx_base_c, tx_base_h);
    const bgSteps = generateSteps(bg_prefix, bg_init_l, bg_l_gap, bg_l_steps, bg_base_c, bg_base_h);
    const bdSteps = generateSteps(bd_prefix, bd_init_l, bd_l_gap, bd_l_steps, bd_base_c, bd_base_h);

    const txStepsDark = generateSteps(tx_prefix, dark_tx_init_l, dark_tx_l_gap, tx_l_steps, tx_base_c, tx_base_h);
    const bgStepsDark = generateSteps(bg_prefix, dark_bg_init_l, dark_bg_l_gap, bg_l_steps, bg_base_c, bg_base_h);
    const bdStepsDark = generateSteps(bd_prefix, dark_bd_init_l, dark_bd_l_gap, bd_l_steps, bd_base_c, bd_base_h);

    return /* css */`
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
    `;
}

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
