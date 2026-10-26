/**
 * Client URL construction for static assets and server endpoints.
 *
 * Three different bases (do not conflate them):
 * - assetUrl / asset base: thin-client loader base when cross-origin, else
 *   settings `cdn` + `basename` (CDN + cluster path), else `/html5client`
 *   on the current host. Static files only.
 * - getServerRoot: thin-client loader origin when cross-origin, else page
 *   origin + cluster path prefix before `/html5client`. Host used to resolve
 *   relative routes when the UI is path-prefixed or served from another origin.
 * - getBbbWebBase: settings `bbbWebBase` (configured bbb-web path or absolute URL).
 *
 * loader.js (thin-client / boot) may stamp:
 *   window.__BBB_HTML5_BASE__            — directory of loader/boot/bundle
 *   window.__BBB_HTML5_ASSET_VERSION__   — webpack compilation hash
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

function html5BaseFromLoader() {
  const base = typeof window !== 'undefined' ? window.__BBB_HTML5_BASE__ : '';
  if (!base || typeof base !== 'string') {
    return null;
  }
  return ensureTrailingSlash(base);
}

function isCrossOriginAssetBase(assetBase) {
  try {
    return new URL(assetBase).origin !== window.location.origin;
  } catch (e) {
    return false;
  }
}

function getAssetBase() {
  const fromLoader = html5BaseFromLoader();
  if (fromLoader && isCrossOriginAssetBase(fromLoader)) {
    return fromLoader;
  }
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
 * Thin-client: when the loader base is cross-origin, use that node's origin.
 * Example: https://proxy.example.com/bbb-01/
 */
export function getServerRoot() {
  const fromLoader = html5BaseFromLoader();
  if (fromLoader && isCrossOriginAssetBase(fromLoader)) {
    return `${new URL(fromLoader).origin}/`;
  }
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
 * Hostname (host[:port]) of the Hocuspocus / shared-notes server.
 * Prefer settings.public.sharedNotes.serverHostname when set; otherwise use
 * getServerRoot() so thin-client (UI on another origin) still targets the node.
 */
export function getHocuspocusServerHostname() {
  const configured = window.meetingClientSettings?.public?.sharedNotes?.serverHostname;
  if (configured) {
    return configured;
  }
  try {
    return new URL(getServerRoot()).host;
  } catch (e) {
    return window.location.host;
  }
}


/**
 * Absolute Learning Analytics Dashboard base (no trailing slash).
 * Absolute settings URLs are kept; relative paths are resolved against
 * getServerRoot() so thin-client (UI on another origin) still opens the
 * dashboard on the BBB node.
 */
export function resolveLearningDashboardBase(learningDashboardBase) {
  const base = String(learningDashboardBase || '').replace(/\/$/, '');
  if (!base) {
    return '';
  }
  if (/^https?:\/\//i.test(base)) {
    return base;
  }
  const root = getServerRoot().replace(/\/$/, '');
  const path = base.startsWith('/') ? base : `/${base}`;
  return `${root}${path}`;
}

/**
 * Cache-busted URL for a static file under the client asset base.
 * relativePath is relative to /html5client/ (leading slash optional).
 * Prefers loader webpack hash, else settings `html5ClientBuild`.
 */
export function assetUrl(relativePath) {
  const path = String(relativePath || '').replace(/^\//, '');
  const base = getAssetBase();
  const version = (typeof window !== 'undefined' && window.__BBB_HTML5_ASSET_VERSION__)
    || window.meetingClientSettings?.public?.app?.html5ClientBuild
    || '';
  const url = base + path;
  if (!version) {
    return url;
  }
  return `${url}${url.indexOf('?') >= 0 ? '&' : '?'}v=${encodeURIComponent(version)}`;
}
