import type { Page as PlaywrightPage, Route } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Serves a locally built html5 client (a `dist/` folder) to a page, without touching the server.
 * Active when `BBB_CLIENT_DIST=<dir>` is set, or per page through `serveClientBuild(page, dir)`
 * (the mixed-version tests give each page its own build). With nothing set it is a no-op.
 *
 * - The join API answers a 302 to `/html5client/?sessionToken=...`, and Playwright calls a route
 *   handler only for the FIRST url of a redirect chain, so the redirect target would never be
 *   intercepted and the page would silently load the server's own client. The join document is
 *   therefore resolved here, through the page's browser context (which stores the session cookie
 *   the join sets), and answered with a page that navigates to the client url: a new navigation,
 *   which the route below does intercept.
 * - `/html5client/` documents (any query) get the dist's index.html; a path the dist has gets that
 *   file. Everything else goes to the network: `/html5client/locales/` (nginx answers it with a
 *   JSON listing), files the dist lacks, GraphQL, websockets, the API and media.
 * - The client registers no service worker, so nothing bypasses the page routes.
 */

const CONTENT_TYPES: Record<string, string> = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.map': 'application/json',
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.wasm': 'application/wasm',
  '.tflite': 'application/octet-stream',
  '.txt': 'text/plain',
};

const fileIndexes = new Map<string, Set<string>>();

function listFiles(dist: string): Set<string> {
  const cached = fileIndexes.get(dist);
  if (cached) return cached;
  const files = new Set<string>();
  const walk = (dir: string, rel: string) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(path.join(dir, entry.name), relPath);
      else files.add(relPath);
    });
  };
  walk(dist, '');
  fileIndexes.set(dist, files);
  return files;
}

/** The bundle a dist's index.html loads on Chromium, e.g. `bundle.17a8b3b877d907d4ea50.js`. */
export function bundleNameOf(dist: string): string {
  const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const match = html.match(/var bundleHash = '([a-f0-9]+)'/);
  if (!match) throw new Error(`no bundleHash in ${dist}/index.html`);
  return `bundle.${match[1]}.js`;
}

export function clientBuildLabel(dist: string): string {
  return path.basename(path.resolve(dist));
}

async function fulfillJoinDocument(page: PlaywrightPage, route: Route) {
  const response = await page.context().request.get(route.request().url(), { maxRedirects: 0 });
  const { location } = response.headers();
  if (response.status() < 300 || response.status() >= 400 || !location) {
    // not a redirect (an error page, for example): show what the server answered
    await route.fulfill({ response });
    return;
  }
  await route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: `<!doctype html><script>location.replace(${JSON.stringify(location)});</script>`,
  });
}

export async function serveClientBuild(page: PlaywrightPage, dist: string, role = 'user'): Promise<void> {
  const root = path.resolve(dist);
  if (!fs.existsSync(path.join(root, 'index.html'))) throw new Error(`BBB_CLIENT_DIST has no index.html: ${root}`);
  const files = listFiles(root);

  // the suite's join urls carry a double slash (`/bigbluebutton//api/join`), so match the path loosely
  await page.route(
    (url) => /\/bigbluebutton\/+api\/join$/.test(url.pathname),
    async (route) => {
      if (route.request().resourceType() !== 'document') return route.continue();
      return fulfillJoinDocument(page, route);
    },
  );

  await page.route('**/html5client/**', async (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    const rel = decodeURIComponent(pathname.replace(/^\/html5client\/?/, ''));
    if (request.resourceType() === 'document' && (rel === '' || rel === 'index.html')) {
      return route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: fs.readFileSync(path.join(root, 'index.html')),
      });
    }
    if (rel && !rel.startsWith('locales/') && files.has(rel)) {
      return route.fulfill({
        status: 200,
        contentType: CONTENT_TYPES[path.extname(rel)] || 'application/octet-stream',
        body: fs.readFileSync(path.join(root, rel)),
      });
    }
    return route.continue();
  });

  console.log(`[client-build] ${clientBuildLabel(root)} (${files.size} files) for ${role}`);
}

const routedPages = new WeakSet<PlaywrightPage>();

/** Applies BBB_CLIENT_DIST (or an explicit dist) to a page once; a no-op when neither is set. */
export async function applyClientBuild(page: PlaywrightPage, dist?: string, role = 'user'): Promise<void> {
  const selected = dist ?? process.env.BBB_CLIENT_DIST;
  if (!selected || routedPages.has(page)) return;
  routedPages.add(page);
  await serveClientBuild(page, selected, role);
}
