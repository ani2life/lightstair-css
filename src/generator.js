import Color from 'colorjs.io';

export function generateCSS(config) {
    const {
        base_c, base_h,
        tx_l, bg_l, bd_l,
        dark_tx_l, dark_bg_l, dark_bd_l,
        tx_l_gap, bg_l_gap, bd_l_gap,
        tx_l_steps, bg_l_steps, bd_l_steps,
        tx_prefix, bg_prefix, bd_prefix,
        tx_start_number, bg_start_number, bd_start_number,
    } = config;

    function generateSteps(prefix, baseL, gap, steps, startNumber, dir) {
        return Array.from({ length: steps }, (_, i) =>
            `--${prefix}-${i + startNumber}: oklch(clamp(0, var(--${baseL}) + (${gap} * ${i} * var(--${dir})), 1) var(--base-c) var(--base-h));`
        ).join('\n');
    }

    const txSteps = generateSteps(tx_prefix, `${tx_prefix}-l`, tx_l_gap, tx_l_steps, tx_start_number, `${tx_prefix}-l-dir`);
    const bgSteps = generateSteps(bg_prefix, `${bg_prefix}-l`, bg_l_gap, bg_l_steps, bg_start_number, `${bg_prefix}-l-dir`);
    const bdSteps = generateSteps(bd_prefix, `${bd_prefix}-l`, bd_l_gap, bd_l_steps, bd_start_number, `${bd_prefix}-l-dir`);

    return /* css */`
        :root {
            --${tx_prefix}-l-dir: 1;
            --${bg_prefix}-l-dir: -1;
            --${bd_prefix}-l-dir: -1;

            @media (prefers-color-scheme: dark) {
                --${tx_prefix}-l-dir: -1;
                --${bg_prefix}-l-dir: 1;
                --${bd_prefix}-l-dir: 1;
            }
        }

        :root {
            --base-c: ${base_c};
            --base-h: ${base_h};

            --${tx_prefix}-l: ${tx_l};
            --${bg_prefix}-l: ${bg_l};
            --${bd_prefix}-l: ${bd_l};

            @media (prefers-color-scheme: dark) {
                --${tx_prefix}-l: ${dark_tx_l};
                --${bg_prefix}-l: ${dark_bg_l};
                --${bd_prefix}-l: ${dark_bd_l};
            }

            ${txSteps}
            ${bgSteps}
            ${bdSteps}
        }
    `;
}

export function generateBakedCSS(config, format) {
    const {
        base_c, base_h,
        tx_l, bg_l, bd_l,
        dark_tx_l, dark_bg_l, dark_bd_l,
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

    function generateSteps(prefix, baseL, gap, steps, startNumber, dir) {
        return Array.from({ length: steps }, (_, i) => {
            const l = clamp(baseL + gap * i * dir);
            return `--${prefix}-${i + startNumber}: ${formatColor(l, base_c, base_h)};`;
        }).join('\n');
    }

    const txSteps = generateSteps(tx_prefix, tx_l, tx_l_gap, tx_l_steps, tx_start_number, TX_DIR);
    const bgSteps = generateSteps(bg_prefix, bg_l, bg_l_gap, bg_l_steps, bg_start_number, BG_DIR);
    const bdSteps = generateSteps(bd_prefix, bd_l, bd_l_gap, bd_l_steps, bd_start_number, BD_DIR);

    const txStepsDark = generateSteps(tx_prefix, dark_tx_l, tx_l_gap, tx_l_steps, tx_start_number, -TX_DIR);
    const bgStepsDark = generateSteps(bg_prefix, dark_bg_l, bg_l_gap, bg_l_steps, bg_start_number, -BG_DIR);
    const bdStepsDark = generateSteps(bd_prefix, dark_bd_l, bd_l_gap, bd_l_steps, bd_start_number, -BD_DIR);

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
