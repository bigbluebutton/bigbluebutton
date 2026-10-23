/**
 * Boot BBB HTML5 client.
 * Expects loader.js to have set __BBB_HTML5_BASE__ / __bbbAssetUrl / build flags.
 *
 * Flow:
 *   1. Bootstrap the page (meta, CSS, fonts, DOM mounts)
 *   2. Load TFLite compatibility scripts (ordered)
 *   3. Assess browser support (UA, WebRTC, WeakRef)
 *   4a. Supported  → small polyfill + load React bundle (Safari legacy pick)
 *   4b. Unsupported → English fallback banner, then localize if possible
 */
(function () {
  var base = window.__BBB_HTML5_BASE__ || '';
  var bundleHash = window.__BBB_HTML5_ASSET_VERSION__ || '';
  var isProduction = !!window.__BBB_HTML5_IS_PRODUCTION__;

  function asset(path) {
    if (typeof window.__bbbAssetUrl === 'function') {
      return window.__bbbAssetUrl(path);
    }
    return base + path;
  }

  // ---------------------------------------------------------------------------
  // DOM helpers
  // ---------------------------------------------------------------------------

  function ensureCharset() {
    if (document.head.querySelector('meta[charset]')) {
      return;
    }
    var meta = document.createElement('meta');
    meta.setAttribute('charset', 'utf-8');
    document.head.insertBefore(meta, document.head.firstChild);
  }

  function ensureNamedMeta(name, content) {
    if (document.head.querySelector('meta[name="' + name + '"]')) {
      return;
    }
    var meta = document.createElement('meta');
    meta.name = name;
    meta.content = content;
    document.head.appendChild(meta);
  }

  function ensureLink(rel, href, attrs) {
    if (document.head.querySelector('link[href="' + href + '"]')) {
      return;
    }
    var link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        link.setAttribute(key, attrs[key]);
      });
    }
    document.head.appendChild(link);
  }

  function ensureElement(parent, tag, id, attrs) {
    var existing = id ? document.getElementById(id) : null;
    if (existing) {
      return existing;
    }
    var el = document.createElement(tag);
    if (id) {
      el.id = id;
    }
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        el.setAttribute(key, attrs[key]);
      });
    }
    parent.appendChild(el);
    return el;
  }

  function loadScriptsOrdered(srcs, done) {
    var index = 0;

    function next() {
      if (index >= srcs.length) {
        done();
        return;
      }
      var src = srcs[index];
      index += 1;
      if (document.querySelector('script[src="' + src + '"]')) {
        next();
        return;
      }
      var script = document.createElement('script');
      script.async = false;
      script.src = src;
      script.onload = next;
      script.onerror = next;
      document.head.appendChild(script);
    }

    next();
  }

  // ---------------------------------------------------------------------------
  // 1. Page bootstrap — meta, stylesheets, fonts, mount points
  // ---------------------------------------------------------------------------

  function addStylesheetsAndFonts() {
    ensureLink('stylesheet', asset('stylesheets/normalize.css'), { crossorigin: 'anonymous' });
    ensureLink('stylesheet', asset('stylesheets/base.css'), { crossorigin: 'anonymous' });
    ensureLink('stylesheet', asset('styles.css'), { crossorigin: 'anonymous' });
    ensureLink('stylesheet', asset('stylesheets/bbb-icons.css'), { crossorigin: 'anonymous' });
    ensureLink('stylesheet', asset('stylesheets/fonts.css'), { crossorigin: 'anonymous' });
    ensureLink('stylesheet', asset('stylesheets/fontSizing.css'), { crossorigin: 'anonymous' });
    ensureLink('stylesheet', asset('stylesheets/modals.css'), { crossorigin: 'anonymous' });
    ensureLink('stylesheet', asset('stylesheets/toastify.css'), { crossorigin: 'anonymous' });
    ensureLink('stylesheet', asset('stylesheets/toggleSwitch.css'), { crossorigin: 'anonymous' });

    ensureLink('preload', asset('fonts/BbbIcons/bbb-icons.woff2'), {
      as: 'font',
      type: 'font/woff2',
      crossorigin: 'anonymous',
    });
    [
      'SourceSansPro-Light',
      'SourceSansPro-Regular',
      'SourceSansPro-Semibold',
      'SourceSansPro-Bold',
      'SourceSansPro-LightItalic',
      'SourceSansPro-Italic',
      'SourceSansPro-SemiboldItalic',
      'SourceSansPro-BoldItalic',
    ].forEach(function (name) {
      ensureLink('preload', asset('fonts/SourceSansPro/' + name + '.woff'), {
        as: 'font',
        crossorigin: 'anonymous',
      });
    });
  }

  function attachGestureGuards() {
    if (window.__bbbGestureHandlersInstalled) {
      return;
    }
    window.__bbbGestureHandlersInstalled = true;
    document.addEventListener('gesturestart', function (e) {
      e.preventDefault();
    });
    document.addEventListener('gesturechange', function (e) {
      e.preventDefault();
    });
  }

  function createMountPoints() {
    ensureElement(document.body, 'div', 'aria-polite-alert', {
      'aria-live': 'polite',
      'aria-atomic': 'false',
      class: 'sr-only',
    });

    if (!document.getElementById('redPointer')) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('style', 'display: none; width: 1px; height: 1px;');
      var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', 'redPointer');
      var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '0');
      circle.setAttribute('cy', '0');
      circle.setAttribute('r', '60');
      circle.setAttribute('fill', 'red');
      g.appendChild(circle);
      defs.appendChild(g);
      svg.appendChild(defs);
      document.body.appendChild(svg);
    }

    var main = document.body.querySelector('main');
    if (!main) {
      main = document.createElement('main');
      document.body.appendChild(main);
    }
    ensureElement(main, 'div', 'app', { role: 'document' });

    ensureElement(document.body, 'span', 'destination');
    ensureElement(document.body, 'audio', 'remote-media');
    ensureElement(document.body, 'audio', 'local-media');
    ensureElement(document.body, 'div', 'modals-container');
    ensureElement(document.body, 'div', 'polling-container');
  }

  function bootstrapPage() {
    document.documentElement.setAttribute('translate', 'no');
    if (!document.title) {
      document.title = 'BigBlueButton';
    }

    ensureCharset();
    ensureNamedMeta('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    ensureNamedMeta('google', 'notranslate');

    if (!document.body) {
      document.documentElement.appendChild(document.createElement('body'));
    }
    document.body.style.backgroundColor = '#102133';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.height = '100%';

    addStylesheetsAndFonts();
    attachGestureGuards();
    createMountPoints();
  }

  // ---------------------------------------------------------------------------
  // 2. TFLite — must finish before the React bundle runs
  // ---------------------------------------------------------------------------

  function loadTfliteScripts(done) {
    loadScriptsOrdered([
      asset('compatibility/tflite-simd.js'),
      asset('compatibility/tflite.js'),
    ], done);
  }

  // ---------------------------------------------------------------------------
  // 3. Browser support assessment
  // ---------------------------------------------------------------------------

  var MIN_VERSIONS = {
    safari: 14, // hasWeakRef below may raise the real floor to 14.1
    chrome: 87,
    firefox: 80,
    edge: 85,
    miui: 0,
  };

  /**
   * @returns {{
   *   supported: boolean,
   *   safariVersion: number|null,
   *   isSafari: boolean,
   *   msgKey: string|null
   * }}
   */
  function assessBrowserSupport() {
    var ua = navigator.userAgent;
    var isSafari = /^((?!chrome|android).)*safari/i.test(ua);

    function parseVersion(regex) {
      var match = ua.match(regex);
      return match ? parseInt(match[1], 10) : null;
    }

    var safariVersion = parseVersion(/Version\/(\d+).*Safari/);
    // livekit-client needs WeakRef; no polyfill is good enough.
    var hasWeakRef = typeof WeakRef === 'function';
    var isOldSafari = isSafari && (
      !hasWeakRef
      || (safariVersion && safariVersion < MIN_VERSIONS.safari)
    );
    var chromeVersion = parseVersion(/(?:Chrome|CriOS)\/(\d+)/);
    var firefoxVersion = parseVersion(/Firefox\/(\d+)/);
    var edgeVersion = parseVersion(/Edg\/(\d+)/);
    var miuiVersion = parseVersion(/MiuiBrowser\/(\d+)/);
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
    var supported = supportedUA && supportsWebRTC && hasWeakRef;

    var msgKey = null;
    if (!supported) {
      if (miuiVersion !== null) {
        msgKey = 'app.legacy.unsupportedBrowser';
      } else if (isOldSafari) {
        msgKey = 'app.legacy.unsupportedSafari';
      } else if (chromeVersion || firefoxVersion || edgeVersion) {
        msgKey = 'app.legacy.upgradeBrowser';
      } else {
        msgKey = 'app.legacy.unsupportedBrowser';
      }
    }

    return {
      supported: supported,
      safariVersion: safariVersion,
      isSafari: isSafari,
      msgKey: msgKey,
    };
  }

  // ---------------------------------------------------------------------------
  // 4a. Supported path — polyfill + React bundle
  // ---------------------------------------------------------------------------

  function ensureObjectHasOwn() {
    if (Object.hasOwn) {
      return;
    }
    Object.defineProperty(Object, 'hasOwn', {
      value: function (obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
      },
      configurable: true,
      writable: true,
    });
  }

  function loadReactBundle(isSafari, safariVersion) {
    var script = document.createElement('script');
    if (
      isProduction
      && isSafari
      && safariVersion
      && safariVersion < 16
      && safariVersion >= MIN_VERSIONS.safari
    ) {
      document.documentElement.classList.add('legacy');
      script.src = base + 'bundle.' + bundleHash + '.safari.js';
    } else {
      script.src = base + 'bundle.' + bundleHash + '.js';
    }
    document.head.appendChild(script);
  }

  function startSupportedClient(support) {
    ensureObjectHasOwn();
    loadReactBundle(support.isSafari, support.safariVersion);
  }

  // ---------------------------------------------------------------------------
  // 4b. Unsupported path — banner + optional locale fetch
  // ---------------------------------------------------------------------------

  var CHROME_LINK = '<a href="https://www.google.com/chrome/" rel="noopener noreferrer">Chrome</a>';
  var FIREFOX_LINK = '<a href="https://getfirefox.com" rel="noopener noreferrer">Firefox</a>';
  var RTL_LANGS = ['ar', 'dv', 'fa', 'he'];

  function replaceLocalePlaceholders(msg) {
    return msg
      .replace('{supportedBrowser1}', CHROME_LINK)
      .replace('{supportedBrowser2}', FIREFOX_LINK);
  }

  function englishFallbackMessages() {
    return {
      'app.legacy.unsupportedBrowser': replaceLocalePlaceholders(
        'It looks like you\'re using a browser that is not supported. Please use a recent version of either {supportedBrowser1} or {supportedBrowser2} for full support.'
      ),
      'app.legacy.upgradeBrowser':
        'It looks like you\'re using an older version of a supported browser. Please upgrade your browser to a recent version for full support.',
      'app.legacy.unsupportedSafari':
        'Please upgrade your browser to Safari 14.1 or newer for full support.',
    };
  }

  function buildLocaleCandidates(parts, localeFiles) {
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

  function tryFetchLocale(candidates, index, onMessages) {
    if (index >= candidates.length) {
      return;
    }
    fetch(asset('locales/' + candidates[index] + '.json'))
      .then(function (resp) {
        if (!resp.ok) throw new Error('not found');
        return resp.json();
      })
      .then(onMessages)
      .catch(function () {
        tryFetchLocale(candidates, index + 1, onMessages);
      });
  }

  function localizeUnsupportedBanner(banner, msgKey) {
    var browserLang = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    var langParts = browserLang.replace(/-/g, '_').split('_');

    if (typeof fetch !== 'function' || langParts[0] === 'en') {
      return;
    }

    function applyLocale(messages) {
      var msg = messages[msgKey];
      if (!msg) return;
      banner.innerHTML = replaceLocalePlaceholders(msg);
      if (RTL_LANGS.indexOf(langParts[0]) !== -1) {
        banner.setAttribute('dir', 'rtl');
      }
    }

    fetch(asset('locales/index.json'))
      .then(function (resp) {
        if (!resp.ok) throw new Error('index not found');
        return resp.json();
      })
      .then(function (localeFiles) {
        return buildLocaleCandidates(langParts, localeFiles);
      })
      .catch(function () {
        return buildLocaleCandidates(langParts, null);
      })
      .then(function (candidates) {
        if (candidates.length > 0) {
          tryFetchLocale(candidates, 0, applyLocale);
        }
      });
  }

  function showUnsupportedBanner(support) {
    var fallback = englishFallbackMessages();
    var app = document.getElementById('app');
    var banner = document.createElement('p');
    banner.className = 'browserWarning';
    banner.innerHTML = fallback[support.msgKey];
    if (app) {
      app.appendChild(banner);
    } else {
      document.body.appendChild(banner);
    }
    localizeUnsupportedBanner(banner, support.msgKey);
  }

  // ---------------------------------------------------------------------------
  // Entry — bootstrap → TFLite → support check → app or banner
  // ---------------------------------------------------------------------------

  function continueAfterCompatibility() {
    var support = assessBrowserSupport();
    if (support.supported) {
      startSupportedClient(support);
      return;
    }
    showUnsupportedBanner(support);
  }

  bootstrapPage();
  loadTfliteScripts(continueAfterCompatibility);
})();
