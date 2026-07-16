import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const SRC_DIR = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_CONFIG_FILE = 'lightstair-css.yml';
export const DEFAULT_CONFIG_PATH = resolve(SRC_DIR, '..', 'templates', DEFAULT_CONFIG_FILE);
