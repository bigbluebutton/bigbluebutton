/**
 * Client URL construction for static assets and server endpoints.
 *
 * Three different bases (do not conflate them):
 * - assetUrl / asset base: settings `cdn` + `basename` (CDN + cluster path),
 *   else `/html5client` on the current host. Static files only.
 * - getServerRoot: page origin + cluster path prefix before `/html5client`.
 *   Host used to resolve relative routes when the UI is path-prefixed.
 * - getBbbWebBase: settings `bbbWebBase` (configured bbb-web path or absolute URL).
 */

function ensureTrailingSlash(value) {
  if (!value) {
    return '';
  }
  return value.endsWith('/') ? value : `${value}/`;
}

/** Path prefix before the /html5client mount (cluster-proxy), or ''. */
function clientPathPrefix() {
  const pathMatch = window.location.pathname.match('^(.*)/html5client/?$');
  return pathMatch ? pathMatch[1] : '';
}

function getAssetBase() {
  const settings = window.meetingClientSettings;
  if (settings?.public?.app) {
    const fromSettings = `${settings.public.app.cdn || ''}${settings.public.app.basename || ''}`;
    if (fromSettings) {
      return ensureTrailingSlash(fromSettings);
    }
  }
  return `${clientPathPrefix()}/html5client/`;
}

/**
 * Page origin with optional cluster path prefix (trailing slash).
 * Example: https://proxy.example.com/bbb-01/
 */
export function getServerRoot() {
  const { hostname, protocol } = window.location;
  const prefix = clientPathPrefix();
  return `${protocol}//${hostname}${prefix ? `${prefix}/` : '/'}`;
}

/**
 * Configured bbb-web base from settings (`public.app.bbbWebBase`).
 * Path or absolute URL — not derived from window.location.
 */
export function getBbbWebBase() {
  return window.meetingClientSettings.public.app.bbbWebBase;
}

/**
 * Cache-busted URL for a static file under the client asset base.
 * relativePath is relative to /html5client/ (leading slash optional).
 * Appends ?v=html5ClientBuild when that setting is present.
 */
export function assetUrl(relativePath) {
  const path = String(relativePath || '').replace(/^\//, '');
  const base = getAssetBase();
  const version = window.meetingClientSettings?.public?.app?.html5ClientBuild || '';
  const url = base + path;
  if (!version) {
    return url;
  }
  return `${url}${url.indexOf('?') >= 0 ? '&' : '?'}v=${encodeURIComponent(version)}`;
}
