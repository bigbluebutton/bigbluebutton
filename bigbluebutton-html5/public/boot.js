/**
 * Classic HTML5 boot: browser gate + load the Vite client entry.
 * Kept as a classic script so unsupported UAs can still show the banner.
 * window.__BBB_ENTRY__ is set by index.html (dev / prod via htmlBootPlugin).
 *
 * Production also ships an unminified twin (bundle.<hash>.safari.js) for
 * Safari 14/15, which historically mis-parse some minified output.
 */
// ES5 on purpose: this file must parse in the browsers it turns away.
/* eslint-disable no-var, vars-on-top, func-names, prefer-arrow-callback, prefer-template,
   object-shorthand, no-plusplus, wrap-iife */
(function () {
  var ua = navigator.userAgent;
  // Taken from this script's own ?v=, which the build stamps in index.html.
  var ownSrc = (document.currentScript && document.currentScript.src) || '';
  var versionQuery = ownSrc.indexOf('?') === -1 ? '' : ownSrc.slice(ownSrc.indexOf('?'));
  var isSafari = /^((?!chrome|android).)*safari/i.test(ua);

  var MIN_VERSIONS = {
    safari: 14, // hasWeakRef below may raise the real floor to 14.1
    chrome: 87,
    firefox: 80,
    edge: 85,
    miui: 0,
  };

  function parseVersion(regex) {
    var match = ua.match(regex);
    return match ? parseInt(match[1], 10) : null;
  }

  var safariVersion = parseVersion(/Version\/(\d+).*Safari/);
  // livekit-client needs WeakRef and no polyfill is good enough. Test the feature itself:
  // iOS browsers are all WebKit based and may omit actual versions.
  var hasWeakRef = typeof WeakRef === 'function';
  var isOldSafari = isSafari && (
    !hasWeakRef
    || (safariVersion && safariVersion < MIN_VERSIONS.safari)
  );
  var chromeVersion = parseVersion(/(?:Chrome|CriOS)\/(\d+)/);
  var firefoxVersion = parseVersion(/Firefox\/(\d+)/);
  var edgeVersion = parseVersion(/Edg\/(\d+)/);
  var miuiVersion = parseVersion(/MiuiBrowser\/(\d+)/);
  // WebRTC support check is based on LiveKit's isBrowserSupported util
  var supportsWebRTC = !!(
    typeof RTCPeerConnection !== 'undefined'
    && RTCPeerConnection
    && navigator.mediaDevices
    && RTCPeerConnection.prototype
    && 'addTransceiver' in RTCPeerConnection.prototype
    && 'addTrack' in RTCPeerConnection.prototype
  );
  var supportedUA = !(
    isOldSafari
    || (chromeVersion && chromeVersion < MIN_VERSIONS.chrome)
    || (firefoxVersion && firefoxVersion < MIN_VERSIONS.firefox)
    || (edgeVersion && edgeVersion < MIN_VERSIONS.edge)
    || (miuiVersion !== null)
  );

  if (supportedUA && supportsWebRTC && hasWeakRef) {
    // livekit-client >= 2.22.3 needs Object.hasOwn (via a dependency), missing in
    // Chrome/Edge < 93, Firefox < 92 and Safari < 15.4.
    if (!Object.hasOwn) {
      Object.defineProperty(Object, 'hasOwn', {
        value: function (obj, key) {
          return Object.prototype.hasOwnProperty.call(obj, key);
        },
        configurable: true,
        writable: true,
      });
    }

    var entry = window.__BBB_ENTRY__;
    if (!entry || String(entry).indexOf('__') === 0) {
      document.body.textContent = 'Missing client entry URL.';
      return;
    }
    // Prod only: Safari 14/15 get the unminified twin. Dev uses a single Vite ESM URL.
    if (
      entry.indexOf('bundle.') !== -1
      && isSafari
      && safariVersion
      && safariVersion < 16
      && safariVersion >= MIN_VERSIONS.safari
    ) {
      document.documentElement.classList.add('legacy');
      entry = entry.replace(/\.js$/, '.safari.js');
    }
    var script = document.createElement('script');
    script.type = 'module';
    script.crossOrigin = 'anonymous';
    script.src = entry;
    document.head.appendChild(script);
    return;
  }

  var msgKey;
  if (miuiVersion !== null) {
    msgKey = 'app.legacy.unsupportedBrowser';
  } else if (isOldSafari) {
    msgKey = 'app.legacy.unsupportedSafari';
  } else if (chromeVersion || firefoxVersion || edgeVersion) {
    msgKey = 'app.legacy.upgradeBrowser';
  } else {
    msgKey = 'app.legacy.unsupportedBrowser';
  }

  var CHROME_LINK = '<a href="https://www.google.com/chrome/" rel="noopener noreferrer">Chrome</a>';
  var FIREFOX_LINK = '<a href="https://getfirefox.com" rel="noopener noreferrer">Firefox</a>';
  function replaceLocalePlaceholders(msg) {
    return msg
      .replace('{supportedBrowser1}', CHROME_LINK)
      .replace('{supportedBrowser2}', FIREFOX_LINK);
  }
  var FALLBACK = {};
  FALLBACK['app.legacy.unsupportedBrowser'] = replaceLocalePlaceholders('It looks like you\'re using a browser that is not supported. Please use a recent version of either {supportedBrowser1} or {supportedBrowser2} for full support.');
  FALLBACK['app.legacy.upgradeBrowser'] = 'It looks like you\'re using an older version of a supported browser. Please upgrade your browser to a recent version for full support.';
  FALLBACK['app.legacy.unsupportedSafari'] = 'Please upgrade your browser to Safari 14.1 or newer for full support.';

  var banner = document.createElement('p');
  banner.className = 'browserWarning';
  banner.innerHTML = FALLBACK[msgKey];
  var appRoot = document.getElementById('app');
  if (appRoot) {
    appRoot.appendChild(banner);
  } else {
    document.body.appendChild(banner);
  }

  // Manual locale fetching so the unsupported browser page is localized
  // This is a simplified version of what intlLoader does, minus:
  // - locale merging: see hardcoded english fallbacks
  // - handling of user-defined language preferences (no access to cli settings etc)
  var RTL_LANGS = ['ar', 'dv', 'fa', 'he'];
  var browserLang = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
  var langParts = browserLang.replace(/-/g, '_').split('_');

  function applyLocale(messages) {
    var msg = messages[msgKey];

    if (!msg) return;

    banner.innerHTML = replaceLocalePlaceholders(msg);

    if (RTL_LANGS.indexOf(langParts[0]) !== -1) {
      banner.setAttribute('dir', 'rtl');
    }
  }

  function tryFetchLocale(candidates, index) {
    if (index >= candidates.length) return;

    fetch('locales/' + candidates[index] + '.json' + versionQuery)
      .then(function (resp) {
        if (!resp.ok) throw new Error('not found');

        return resp.json();
      })
      .then(applyLocale)
      .catch(function () {
        tryFetchLocale(candidates, index + 1);
      });
  }

  function buildCandidates(parts, localeFiles) {
    if (!localeFiles) {
      var guesses = [];
      if (parts.length > 1) {
        guesses.push(parts[0] + '_' + parts[1].toUpperCase());
      }
      guesses.push(parts[0]);
      return guesses;
    }

    var available = localeFiles.map(function (f) {
      return f.replace('.json', '');
    });
    var candidates = [];

    if (parts.length > 1) {
      var exact = parts[0] + '_' + parts[1].toUpperCase();
      if (available.indexOf(exact) !== -1) {
        candidates.push(exact);
      }
    }

    if (available.indexOf(parts[0]) !== -1) {
      candidates.push(parts[0]);
    }

    for (var j = 0; j < available.length; j++) {
      if (available[j].split('_')[0] === parts[0] && candidates.indexOf(available[j]) === -1) {
        candidates.push(available[j]);
        break;
      }
    }

    return candidates;
  }

  if (typeof fetch === 'function' && langParts[0] !== 'en') {
    fetch('locales/index.json' + versionQuery)
      .then(function (resp) {
        if (!resp.ok) throw new Error('index not found');
        return resp.json();
      })
      .then(function (localeFiles) {
        return buildCandidates(langParts, localeFiles);
      })
      .catch(function () {
        return buildCandidates(langParts, null);
      })
      .then(function (candidates) {
        if (candidates.length > 0) {
          tryFetchLocale(candidates, 0);
        }
      });
  }
})();
