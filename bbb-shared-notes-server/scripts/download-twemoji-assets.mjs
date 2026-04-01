#!/usr/bin/env node
/**
 * Postinstall script — downloads Twemoji SVG assets from the GitHub release tarball.
 * Assets are stored in assets/twemoji/svg/ and read from disk at PDF-export time,
 * so the server never needs external network access during runtime.
 *
 * The download is skipped if the directory already exists and contains files.
 */

import { existsSync, mkdirSync } from 'node:fs';
import { readdir, rm } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const execAsync = promisify(exec);

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const assetsDir = join(projectRoot, 'assets', 'twemoji', 'svg');

const TWEMOJI_VERSION = '14.0.2';
const TARBALL_URL = `https://github.com/twitter/twemoji/archive/refs/tags/v${TWEMOJI_VERSION}.tar.gz`;

async function hasFiles(dir) {
  try {
    const files = await readdir(dir);
    return files.length > 0;
  } catch {
    return false;
  }
}

async function main() {
  if (await hasFiles(assetsDir)) {
    console.log(`[twemoji] SVG assets already present at ${assetsDir}, skipping download.`);
    return;
  }

  console.log(`[twemoji] Downloading Twemoji ${TWEMOJI_VERSION} SVG assets...`);
  mkdirSync(assetsDir, { recursive: true });

  const tmpFile = join(tmpdir(), `twemoji-${TWEMOJI_VERSION}.tar.gz`);

  try {
    // Download the release tarball
    await execAsync(`curl -L --silent --show-error -o "${tmpFile}" "${TARBALL_URL}"`);

    // Extract only the svg/ directory, stripping the 3 leading path components
    // (twemoji-14.0.2 / assets / svg) so SVG files land directly in assetsDir
    await execAsync(
      `tar xzf "${tmpFile}" --strip-components=3 -C "${assetsDir}" "twemoji-${TWEMOJI_VERSION}/assets/svg"`
    );

    const files = await readdir(assetsDir);
    console.log(`[twemoji] Downloaded ${files.length} SVG files to ${assetsDir}`);
  } finally {
    // Clean up the temp tarball regardless of success/failure
    if (existsSync(tmpFile)) {
      await rm(tmpFile, { force: true });
    }
  }
}

main().catch((err) => {
  console.warn(`[twemoji] Failed to download SVG assets: ${err.message}`);
  console.warn('[twemoji] PDF emoji rendering will fall back to raw Unicode glyphs.');
  // Exit 0 so npm install is not broken by a failed download
  process.exit(0);
});
