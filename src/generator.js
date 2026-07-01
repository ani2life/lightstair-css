import Color from 'colorjs.io';

export function generateCSS(config) {
    const {
        base_c, base_h,
        tx_l, bg_l, bd_l,
        dark_tx_l, dark_bg_l, dark_bd_l,
        tx_l_gap, bg_l_gap, bd_l_gap,
        tx_l_steps, bg_l_steps, bd_l_steps,
    } = config;

    function generateSteps(prefix, baseL, gap, steps, dir) {
        return Array.from({ length: steps }, (_, i) =>
            `--${prefix}-${i}: oklch(clamp(0, var(--${baseL}) + (${gap} * ${i} * var(--${dir})), 1) var(--base-c) var(--base-h));`
        ).join('\n');
    }

    const txSteps = generateSteps('tx', 'tx-l', tx_l_gap, tx_l_steps, 'tx-l-dir');
    const bgSteps = generateSteps('bg', 'bg-l', bg_l_gap, bg_l_steps, 'bg-l-dir');
    const bdSteps = generateSteps('bd', 'bd-l', bd_l_gap, bd_l_steps, 'bd-l-dir');

    return /* css */`
        :root {
            --tx-l-dir: 1;
            --bg-l-dir: -1;
            --bd-l-dir: -1;

            @media (prefers-color-scheme: dark) {
                --tx-l-dir: -1;
                --bg-l-dir: 1;
                --bd-l-dir: 1;
            }
        }

        :root {
            --base-c: ${base_c};
            --base-h: ${base_h};

            --tx-l: ${tx_l};
            --bg-l: ${bg_l};
            --bd-l: ${bd_l};

            @media (prefers-color-scheme: dark) {
                --tx-l: ${dark_tx_l};
                --bg-l: ${dark_bg_l};
                --bd-l: ${dark_bd_l};
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

    function generateSteps(prefix, baseL, gap, steps, dir) {
        return Array.from({ length: steps }, (_, i) => {
            const l = clamp(baseL + gap * i * dir);
            return `--${prefix}-${i}: ${formatColor(l, base_c, base_h)};`;
        }).join('\n');
    }

    const txSteps = generateSteps('tx', tx_l, tx_l_gap, tx_l_steps, TX_DIR);
    const bgSteps = generateSteps('bg', bg_l, bg_l_gap, bg_l_steps, BG_DIR);
    const bdSteps = generateSteps('bd', bd_l, bd_l_gap, bd_l_steps, BD_DIR);

    const txStepsDark = generateSteps('tx', dark_tx_l, tx_l_gap, tx_l_steps, -TX_DIR);
    const bgStepsDark = generateSteps('bg', dark_bg_l, bg_l_gap, bg_l_steps, -BG_DIR);
    const bdStepsDark = generateSteps('bd', dark_bd_l, bd_l_gap, bd_l_steps, -BD_DIR);

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
