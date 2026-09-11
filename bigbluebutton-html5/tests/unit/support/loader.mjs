/**
 * Node module-customization hooks that let the client's source run under
 * `node --test` without a bundler.
 *
 * Three jobs:
 *   1. Resolve the root-absolute specifiers the client uses ('/imports/...'),
 *      which are a webpack alias and not valid Node paths.
 *   2. Transpile .ts/.tsx/.jsx on the fly with the presets already declared in
 *      the project's babel.config.js.
 *   3. Swap a small, fixed set of modules for the test doubles in ./doubles.
 *      Only boundaries are doubled - browser/LiveKit/GraphQL/styling seams the
 *      unit under test talks to. Nothing inside autoplay-modal/ is doubled.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transformSync } from '@babel/core';

const SUPPORT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DOUBLES_DIR = path.join(SUPPORT_DIR, 'doubles');
const HTML5_ROOT = path.resolve(SUPPORT_DIR, '..', '..', '..');
const NODE_MODULES = `${path.sep}node_modules${path.sep}`;

// Bare specifiers replaced wholesale.
const PACKAGE_DOUBLES = new Map([
  ['@livekit/components-react', 'livekit-components-react.mjs'],
  ['react-intl', 'react-intl.mjs'],
]);

// Project files replaced wholesale, keyed by their path relative to the html5
// root with the extension dropped.
const FILE_DOUBLES = new Map([
  ['imports/startup/client/logger', 'logger.mjs'],
  ['imports/ui/services/storage/hooks', 'storage-hooks.mjs'],
  ['imports/ui/components/audio/audio-graphql/hooks/useIsAudioConnected', 'use-is-audio-connected.mjs'],
  ['imports/ui/core/singletons/modalController', 'modal-controller.mjs'],
  ['imports/ui/components/audio/autoplay/component', 'autoplay-prompt.mjs'],
  ['imports/ui/components/livekit/autoplay-modal/styles', 'styles.mjs'],
]);

const CANDIDATE_SUFFIXES = [
  '', '.ts', '.tsx', '.js', '.jsx', '.mjs',
  '/index.ts', '/index.tsx', '/index.js', '/index.jsx',
];

const doubleUrl = (file) => pathToFileURL(path.join(DOUBLES_DIR, file)).href;

function resolveFile(base) {
  for (const suffix of CANDIDATE_SUFFIXES) {
    const candidate = base + suffix;
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

// A project file resolves to its double when one is registered, otherwise to
// itself. A double is keyed by the specifier people write, so a module that is
// a directory (logger/index.js) has to match on the directory too.
function projectUrl(file) {
  const key = path.relative(HTML5_ROOT, file).split(path.sep).join('/').replace(/\.(tsx?|jsx?)$/, '');
  const double = FILE_DOUBLES.get(key) ?? FILE_DOUBLES.get(key.replace(/\/index$/, ''));
  return double ? doubleUrl(double) : pathToFileURL(file).href;
}

export async function resolve(specifier, context, nextResolve) {
  const pkgDouble = PACKAGE_DOUBLES.get(specifier);
  if (pkgDouble) return { url: doubleUrl(pkgDouble), format: 'module', shortCircuit: true };

  if (specifier.startsWith('/imports/') || specifier.startsWith('/client/')) {
    const file = resolveFile(path.join(HTML5_ROOT, specifier));
    if (file) return { url: projectUrl(file), shortCircuit: true };
  }

  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const { parentURL } = context;
    // Only project files. Relative imports inside node_modules must keep going
    // through Node's own resolver so package exports/conditions still apply.
    if (parentURL?.startsWith('file:')) {
      const parentDir = path.dirname(fileURLToPath(parentURL));
      if (parentDir.startsWith(HTML5_ROOT) && !parentDir.includes(NODE_MODULES)) {
        const file = resolveFile(path.resolve(parentDir, specifier));
        if (file) return { url: projectUrl(file), shortCircuit: true };
      }
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.startsWith('file:')) {
    const file = fileURLToPath(url);
    if (/\.(ts|tsx|jsx)$/.test(file) && !file.includes(NODE_MODULES)) {
      const { code } = transformSync(readFileSync(file, 'utf8'), {
        filename: file,
        babelrc: false,
        configFile: false,
        sourceMaps: 'inline',
        // Type stripping and JSX only. Module syntax is left as ESM so Node
        // links these files itself.
        presets: [
          ['@babel/preset-typescript', { isTSX: file.endsWith('.tsx'), allExtensions: true }],
          ['@babel/preset-react', { runtime: 'classic' }],
        ],
      });
      return { format: 'module', source: code, shortCircuit: true };
    }
  }
  return nextLoad(url, context);
}
