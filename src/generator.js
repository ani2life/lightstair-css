import Color from 'colorjs.io';

export function generateCSS(config) {
    const {
        tx_base_c, tx_base_h,
        bg_base_c, bg_base_h,
        bd_base_c, bd_base_h,
        tx_init_l, bg_init_l, bd_init_l,
        dark_tx_init_l, dark_bg_init_l, dark_bd_init_l,
        tx_l_gap, bg_l_gap, bd_l_gap,
        tx_l_steps, bg_l_steps, bd_l_steps,
        tx_prefix, bg_prefix, bd_prefix,
        tx_start_number, bg_start_number, bd_start_number,
    } = config;

    function generateSteps(prefix, gap, steps, startNumber) {
        return Array.from({ length: steps }, (_, i) =>
            `--${prefix}-${i + startNumber}:
                oklch(clamp(0, var(--${prefix}-init-l) + (${gap} * ${i} * var(--${prefix}-l-dir)), 1)
                var(--${prefix}-base-c)
                var(--${prefix}-base-h));`
        ).join('\n');
    }

    const txSteps = generateSteps(tx_prefix, tx_l_gap, tx_l_steps, tx_start_number);
    const bgSteps = generateSteps(bg_prefix, bg_l_gap, bg_l_steps, bg_start_number);
    const bdSteps = generateSteps(bd_prefix, bd_l_gap, bd_l_steps, bd_start_number);

    return /* css */`
        :root {
            --${tx_prefix}-l-dir: 1;
            --${bg_prefix}-l-dir: -1;
            --${bd_prefix}-l-dir: -1;

            --${tx_prefix}-base-c: ${tx_base_c};
            --${tx_prefix}-base-h: ${tx_base_h};
            --${bg_prefix}-base-c: ${bg_base_c};
            --${bg_prefix}-base-h: ${bg_base_h};
            --${bd_prefix}-base-c: ${bd_base_c};
            --${bd_prefix}-base-h: ${bd_base_h};

            --${tx_prefix}-init-l: ${tx_init_l};
            --${bg_prefix}-init-l: ${bg_init_l};
            --${bd_prefix}-init-l: ${bd_init_l};

            @media (prefers-color-scheme: dark) {
                --${tx_prefix}-l-dir: -1;
                --${bg_prefix}-l-dir: 1;
                --${bd_prefix}-l-dir: 1;

                --${tx_prefix}-init-l: ${dark_tx_init_l};
                --${bg_prefix}-init-l: ${dark_bg_init_l};
                --${bd_prefix}-init-l: ${dark_bd_init_l};
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
        tx_l_steps, bg_l_steps, bd_l_steps,
        tx_prefix, bg_prefix, bd_prefix,
        tx_start_number, bg_start_number, bd_start_number,
    } = config;

    const TX_DIR = 1;
    const BG_DIR = -1;
    const BD_DIR = -1;

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

    function generateSteps(prefix, baseL, gap, steps, startNumber, dir, c, h) {
        return Array.from({ length: steps }, (_, i) => {
            const l = clamp(baseL + gap * i * dir);
            return `--${prefix}-${i + startNumber}: ${formatColor(l, c, h)};`;
        }).join('\n');
    }

    const txSteps = generateSteps(tx_prefix, tx_init_l, tx_l_gap, tx_l_steps, tx_start_number, TX_DIR, tx_base_c, tx_base_h);
    const bgSteps = generateSteps(bg_prefix, bg_init_l, bg_l_gap, bg_l_steps, bg_start_number, BG_DIR, bg_base_c, bg_base_h);
    const bdSteps = generateSteps(bd_prefix, bd_init_l, bd_l_gap, bd_l_steps, bd_start_number, BD_DIR, bd_base_c, bd_base_h);

    const txStepsDark = generateSteps(tx_prefix, dark_tx_init_l, tx_l_gap, tx_l_steps, tx_start_number, -TX_DIR, tx_base_c, tx_base_h);
    const bgStepsDark = generateSteps(bg_prefix, dark_bg_init_l, bg_l_gap, bg_l_steps, bg_start_number, -BG_DIR, bg_base_c, bg_base_h);
    const bdStepsDark = generateSteps(bd_prefix, dark_bd_init_l, bd_l_gap, bd_l_steps, bd_start_number, -BD_DIR, bd_base_c, bd_base_h);

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
