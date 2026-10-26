(async function () {
  var STORAGE_SERVER = 'bbb-thin-client:server';
  var STORAGE_TOKEN = 'bbb-thin-client:sessionToken';
  var AUTH_STORAGE_PREFIX = 'BBB_';

  function fail(message) {
    document.body.textContent = message;
  }

  function isOriginAllowed(origin, config) {
    if (origin === window.location.origin) {
      return true;
    }
    var origins = (config && config.allowedOrigins) || [];
    for (var i = 0; i < origins.length; i++) {
      if (origins[i] === origin) {
        return true;
      }
    }
    return false;
  }

  function parseOrigin(server) {
    var serverUrl = new URL(server);
    if (serverUrl.protocol !== 'https:' && serverUrl.protocol !== 'http:') {
      throw new Error('Server must use http or https.');
    }
    // server= is origin-only (join appends scheme://host[:port], no path).
    if ((serverUrl.pathname && serverUrl.pathname !== '/') || serverUrl.search || serverUrl.hash) {
      throw new Error('server must be an origin only (no path, query, or fragment).');
    }
    return serverUrl.origin;
  }

  function clearAuthSessionStorage() {
    var toRemove = [];
    for (var i = 0; i < sessionStorage.length; i++) {
      var key = sessionStorage.key(i);
      if (key && key.indexOf(AUTH_STORAGE_PREFIX) === 0) {
        toRemove.push(key);
      }
    }
    for (var j = 0; j < toRemove.length; j++) {
      sessionStorage.removeItem(toRemove[j]);
    }
  }

  function clearStoredJoin() {
    sessionStorage.removeItem(STORAGE_SERVER);
    sessionStorage.removeItem(STORAGE_TOKEN);
    // Drop React Auth keys so an old sessionToken cannot be reused against a new node.
    clearAuthSessionStorage();
  }

  function stripServerFromUrl() {
    var url = new URL(window.location.href);
    if (!url.searchParams.has('server')) {
      return;
    }
    url.searchParams.delete('server');
    var next = url.pathname + url.search + url.hash;
    window.history.replaceState({}, '', next);
  }

  var params = new URLSearchParams(window.location.search);
  var urlServer = params.get('server');
  var urlToken = params.get('sessionToken');
  var storedServer = sessionStorage.getItem(STORAGE_SERVER);
  var storedToken = sessionStorage.getItem(STORAGE_TOKEN);

  var urlOrigin = null;
  if (urlServer) {
    try {
      urlOrigin = parseOrigin(urlServer);
    } catch (e) {
      fail(e.message || 'Invalid server parameter.');
      return;
    }
  }

  // New join params that disagree with a prior thin-client join → drop the old pairing
  // so a sessionToken is never reused against a different BBB node.
  if (urlOrigin || urlToken) {
    var serverChanged = !!(urlOrigin && storedServer && urlOrigin !== storedServer);
    var tokenChanged = !!(urlToken && storedToken && urlToken !== storedToken);
    if (serverChanged) {
      clearStoredJoin();
      storedServer = null;
      storedToken = null;
    } else if (tokenChanged) {
      sessionStorage.removeItem(STORAGE_TOKEN);
      clearAuthSessionStorage();
      storedToken = null;
    }
  }

  var origin = urlOrigin || storedServer;
  if (!origin) {
    fail('Missing server parameter from join redirect (thin-client entry).');
    return;
  }

  var config = { allowedOrigins: [] };

  if (origin !== window.location.origin) {
    try {
      var configUrl = new URL('allowed-servers.json', window.location.href);
      var response = await fetch(configUrl.href, {
        credentials: 'same-origin',
        cache: 'no-cache',
      });
      if (!response.ok) {
        fail('Could not load allowed-servers.json (required for remote BBB hosts).');
        return;
      }
      config = await response.json();
    } catch (e) {
      fail('Could not load or parse allowed-servers.json.');
      return;
    }
  }

  if (!isOriginAllowed(origin, config)) {
    fail('Server origin is not allowed by this UI host.');
    return;
  }

  sessionStorage.setItem(STORAGE_SERVER, origin);
  if (urlToken) {
    sessionStorage.setItem(STORAGE_TOKEN, urlToken);
  }

  // Drop server= from the address bar; sessionToken stays for React Auth (it strips it).
  stripServerFromUrl();

  // Thin-client: nodes serve HTML5 at {origin}/html5client/ (not under a path prefix).
  // loader.js stamps __BBB_HTML5_BASE__ from its own src for assets + API.
  var script = document.createElement('script');
  script.src = new URL('/html5client/loader.js', origin).href;
  document.head.appendChild(script);
})();
