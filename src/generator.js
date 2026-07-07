import Color from 'colorjs.io';

export function generateCSS(config) {
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
            const step = i + 1;
            const calcL = `clamp(0, ${initL} + (${lGap} * ${step}), 1)`;
            return `--${prefix}-${step}: oklch(${calcL} ${baseC} ${baseH});`
        }).join('\n');
    }

    const txSteps = generateSteps(tx_prefix, tx_l_steps);
    const bgSteps = generateSteps(bg_prefix, bg_l_steps);
    const bdSteps = generateSteps(bd_prefix, bd_l_steps);

    return /* css */`
        :root {
            --${tx_prefix}-base-c: ${tx_base_c};
            --${tx_prefix}-base-h: ${tx_base_h};
            --${bg_prefix}-base-c: ${bg_base_c};
            --${bg_prefix}-base-h: ${bg_base_h};
            --${bd_prefix}-base-c: ${bd_base_c};
            --${bd_prefix}-base-h: ${bd_base_h};

            --${tx_prefix}-init-l: ${tx_init_l};
            --${bg_prefix}-init-l: ${bg_init_l};
            --${bd_prefix}-init-l: ${bd_init_l};

            --${tx_prefix}-l-gap: ${tx_l_gap};
            --${bg_prefix}-l-gap: ${bg_l_gap};
            --${bd_prefix}-l-gap: ${bd_l_gap};

            @media (prefers-color-scheme: dark) {
                --${tx_prefix}-init-l: ${dark_tx_init_l};
                --${bg_prefix}-init-l: ${dark_bg_init_l};
                --${bd_prefix}-init-l: ${dark_bd_init_l};

                --${tx_prefix}-l-gap: ${dark_tx_l_gap};
                --${bg_prefix}-l-gap: ${dark_bg_l_gap};
                --${bd_prefix}-l-gap: ${dark_bd_l_gap};
            }

            ${txSteps}
            ${bgSteps}
            ${bdSteps}
        }
    `;
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

    function clamp(val) {
        return Math.min(1, Math.max(0, val));
    }

    function formatNum(val) {
        return parseFloat(val.toFixed(6));
    }

    function formatColor(l, c, h) {
        const color = new Color({ spaceId: 'oklch', coords: [l, c, h] });
        return color.toString({ format: format });
    }

    function generateSteps(prefix, initL, gap, steps, c, h) {
        return Array.from({ length: steps }, (_, i) => {
            const step = i + 1;
            const l = clamp(initL + gap * step);
            return `--${prefix}-${step}: ${formatColor(l, c, h)};`;
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
