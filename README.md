<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./preview/icon-dark.svg">
        <img src="./preview/icon-light.svg" alt="LightStair CSS logo" width="140">
    </picture>
</p>

<h1 align="center">LightStair CSS</h1>

<p align="center">
    <a href="README.ko.md">한국어</a> ·
    <a href="README.md">English</a>
</p>

<p align="center">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
</p>

<p align="center">
    A CLI tool that generates CSS files by setting brightness steps for text, background, and border colors based on the OKLCH color space.
</p>

<p align="center">
    <img src="./assets/demo.gif" alt="Demo" width="800">
</p>

---

## Why This Tool

In CSS, you may want to declare and use multiple brightness steps for a given color. However, even for the same perceived brightness, text, background, and border colors require different brightness levels. You also need to match combinations of text, background, and border colors, and account for dark mode. This tool simplifies these processes.

## Features

- Configuration based on the OKLCH color space
- Export in OKLCH, RGB, and HEX color formats
- Dark mode support
- Local server preview
  - Text × Background × Border color combination preview
  - Side-by-side light and dark theme views

## Installation

```bash
npm install lightstair-css
```

## CLI

### Help

```bash
lightstair-css --help
```

### Generate Configuration File

```bash
lightstair-css init
```

Creates a default [lightstair-css.yml](./templates/lightstair-css.yml) configuration file in the current directory. Skips if a configuration file already exists.

### Generate CSS File

```bash
lightstair-css [options]
```

Generates a `lightstair-css.css` file in the current directory by default. If no configuration file exists, a default one is automatically created.

The default format is `OKLCH`, and the generated CSS variables use dynamically computed color values. Use the `--bake [format]` option to generate CSS with pre-computed color values.

```css
/* Default code */
--tx-1: oklch(clamp(0, var(--tx-init-l) + var(--tx-l-gap) * 0, 1) var(--tx-base-c) var(--tx-base-h));

/* Pre-computed code with `--bake oklch` option */
--tx-1: oklch(0.31 0.01 250);

/* Pre-computed code with `--bake rgb` option */
--tx-1: rgb(44.585 48.788 53.291);

/* Pre-computed code with `--bake hex` option */
--tx-1: #2d3135;
```

### Run Preview Server

```bash
lightstair-css preview [options]
```

Open `http://localhost:[port]` in your browser to view the preview. If no port is specified, a random port is used.

### Command Examples

```bash
# Show help
lightstair-css --help

# Create default configuration file
lightstair-css init

# Generate CSS with default settings
lightstair-css

# Specify configuration and output files
lightstair-css -c my-config.yml -o dist/my-colors.css

# Generate CSS with pre-computed RGB format
lightstair-css --bake rgb

# Generate CSS with pre-computed HEX format and specify output file
lightstair-css --bake hex -o dist/my-colors.css

# Start preview server
lightstair-css preview

# Start preview server with port and configuration file
lightstair-css preview -p 3000 -c my-config.yml
```
