import React, { useCallback, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
import { ErrorScreen } from '/imports/ui/components/error-screen/component';
import useCurrentLocale from '/imports/ui/core/local-states/useCurrentLocale';
import logger from './logger';

// Backoff between locale fetch retries: 1s, 2s, then 5s repeated, each with equal
// jitter (the effective delay is uniformly random in [base/2, base]) to avoid a
// thundering herd of clients retrying in lockstep after a shared network blip. A
// transient failure (a network rejection such as ERR_NETWORK_CHANGED, or a 5xx/429
// response) keeps retrying until it succeeds, the component unmounts (the fetch is
// aborted), or the shared deadline passes. On give-up the client shows an error
// screen instead of a blank one: the client must never be left on a blank screen
// because a transient network blip dropped the locale.
const RETRY_DELAYS = [1000, 2000, 5000];
// Mirrors CustomUsersSettings' CONNECTION_TIMEOUT (the parent in client/main.tsx):
// stop retrying after this long and give up so the loading state resolves into an
// error screen instead of spinning forever. The deadline is shared across the
// index fetch and every language-set fetch of a single load (threaded from
// fetchLocalizedMessages), so the whole load is bounded by one budget rather than
// each fetch getting its own.
const MAX_RETRY_DURATION = 60000;

interface LocaleJson {
  [key: string]: string;
}

// The locales index is an array of available locale entries; only `name` is used
// to build the usable-locale list, so that is all we type here.
interface LocaleIndexEntry {
  name: string;
}

interface IntlLoaderContainerProps {
  children: React.ReactNode;
}

interface IntlLoaderProps extends IntlLoaderContainerProps {
  currentLocale: string;
  setCurrentLocale: (locale: string) => void;
}

// Waits `ms` and resolves to true, or resolves early to false if the signal
// aborts (already aborted at call time, or aborts while waiting). The abort
// listener is always detached: the setTimeout callback removes it on normal
// completion, and the once:true listener removes itself when it fires. This
// keeps listeners from piling up across retries on a long-lived signal.
const waitForDelay = (ms: number, signal: AbortSignal): Promise<boolean> => new Promise((resolve) => {
  if (signal.aborted) {
    resolve(false);
    return;
  }
  const onAbort = () => {
    clearTimeout(timer);
    resolve(false);
  };
  const timer = setTimeout(() => {
    signal.removeEventListener('abort', onAbort);
    resolve(true);
  }, ms);
  signal.addEventListener('abort', onAbort, { once: true });
});

const buildFetchLocale = <T = LocaleJson>(
  locale: string,
  signal: AbortSignal,
  deadline: number,
): Promise<T | false> => {
  const clientVersion = window.meetingClientSettings.public.app.html5ClientBuild;
  const url = `locales/${locale !== 'index' ? `${locale}.json?v=${clientVersion}` : ''}`;

  const attempt = async (retryCount: number): Promise<T | false> => {
    // Per-attempt controller: composes the outer unmount signal with a timeout so a
    // hung fetch (server accepts the connection but never responds) still aborts at
    // the shared deadline instead of stranding the client on the loading screen.
    // Aborting attemptController (not the outer signal) keeps the outer/unmount
    // abort distinguishable from the deadline timeout in the catch below. We do not
    // use AbortSignal.any(): Safari 16 support is required (see index.html).
    const attemptController = new AbortController();
    const onOuterAbort = () => attemptController.abort();
    signal.addEventListener('abort', onOuterAbort, { once: true });
    // A once-listener never fires for an already-dispatched abort, so if the outer
    // signal aborted before this attempt began, mirror it onto attemptController now.
    if (signal.aborted) attemptController.abort();
    const timeoutId = setTimeout(() => attemptController.abort(), Math.max(0, deadline - Date.now()));
    try {
      const response = await fetch(url, { signal: attemptController.signal });
      if (!response.ok) {
        // 5xx and 429 are transient (server overloaded / rate limited): fall
        // through to the retry path by throwing so the catch handles the backoff.
        if (response.status >= 500 || response.status === 429) {
          throw new Error(`HTTP ${response.status}`);
        }
        // Any other HTTP error (e.g. 404 for a locale that does not exist) is a
        // legitimate fallback, not a transient failure: resolve false so the merge
        // step falls back to another locale. Retrying would never help.
        return false;
      }
      return await response.json() as T;
    } catch (error) {
      // The component unmounted mid-flight: stop, do not retry.
      if (signal.aborted) return false;
      // Malformed JSON is not transient (the file is served but corrupt), so
      // retrying is pointless. Fall back to another locale.
      if (error instanceof SyntaxError) {
        logger.error({ logCode: 'intl_parse_locale_SyntaxError' }, `Could not parse locale file ${locale}.json, invalid json`);
        return false;
      }
      // A transient failure: the fetch rejected (network down/changed ->
      // TypeError: Failed to fetch) or the response was a 5xx/429. Retry with
      // backoff until the network recovers, unless the shared deadline has
      // passed: then give up and fall back so the load can resolve.
      if (Date.now() > deadline) {
        logger.error(
          {
            logCode: 'intl_fetch_locale_giveup',
            extraInfo: {
              locale,
              retryCount,
              error: error instanceof Error ? error.message : String(error),
            },
          },
          `Gave up fetching locale ${locale} after ${retryCount} retries: retry budget exhausted`,
        );
        return false;
      }
      // Clamp the backoff to the time left before the deadline so the wait cannot
      // overshoot the budget (which would push the give-up past MAX_RETRY_DURATION).
      const remaining = deadline - Date.now();
      const baseDelay = Math.min(RETRY_DELAYS[Math.min(retryCount, RETRY_DELAYS.length - 1)], remaining);
      // Equal jitter: uniformly random in [base/2, base].
      const delay = baseDelay / 2 + (Math.random() * baseDelay) / 2;
      logger.warn(
        {
          logCode: 'intl_fetch_locale_retry',
          extraInfo: {
            locale,
            retryCount,
            delay,
            error: error instanceof Error ? error.message : String(error),
          },
        },
        `Locale fetch failed for ${locale}, retrying in ${Math.round(delay)}ms`,
      );
      // waitForDelay resolves false when the signal aborted before or during the
      // wait; skip the doomed next fetch and fall back instead.
      const completed = await waitForDelay(delay, signal);
      if (!completed) return false;
      return attempt(retryCount + 1);
    } finally {
      // Detach this attempt's timeout and outer-abort listener so neither piles up
      // across retries. Running before the recursive attempt's promise settles is
      // fine: the next attempt owns its own controller, timeout and listener.
      clearTimeout(timeoutId);
      signal.removeEventListener('abort', onOuterAbort);
    }
  };

  return attempt(0);
};

const fetchLocaleOptions = (locale: string, init: boolean, localesList: string[] = []) => {
  const clientSettings = window.meetingClientSettings.public;
  const { fallbackLocale: fallback, overrideLocale: override } = clientSettings.app.defaultSettings.application;
  const browserLocale = override && init ? override.split(/[-_]/g) : locale.split(/[-_]/g);
  const defaultLanguage = fallback;
  const fallbackOnEmptyString = clientSettings.app.fallbackOnEmptyLocaleString;

  let localeFile = fallback;
  let normalizedLocale: string = '';

  const usableLocales = localesList
    .map((file) => file.replace('.json', ''))
    .reduce((locales: string[], locale: string) => (locale.match(browserLocale[0])
      ? [...locales, locale]
      : locales), []);

  const regionDefault = usableLocales.find((locale: string) => browserLocale[0] === locale);

  if (browserLocale.length > 1) {
    // browser asks for specific locale
    normalizedLocale = `${browserLocale[0]}_${browserLocale[1]?.toUpperCase()}`;

    const normDefault = usableLocales.find((locale) => normalizedLocale === locale);
    if (normDefault) {
      localeFile = normDefault;
    } else if (regionDefault) {
      localeFile = regionDefault;
    } else {
      const specFallback = usableLocales.find((locale) => browserLocale[0] === locale.split('_')[0]);
      if (specFallback) localeFile = specFallback;
    }
  } else {
    // browser asks for region default locale
    // eslint-disable-next-line no-lonely-if
    if (regionDefault && localeFile === fallback && regionDefault !== localeFile) {
      localeFile = regionDefault;
    } else {
      const normFallback = usableLocales.find((locale) => browserLocale[0] === locale.split('_')[0]);
      if (normFallback) localeFile = normFallback;
    }
  }

  return {
    normalizedLocale: localeFile,
    regionDefaultLocale: (regionDefault && regionDefault !== localeFile) ? regionDefault : '',
    defaultLocale: defaultLanguage,
    fallbackOnEmptyLocaleString: fallbackOnEmptyString,
  };
};

const IntlLoader: React.FC<IntlLoaderProps> = ({
  children,
  currentLocale,
  setCurrentLocale,
}) => {
  const [fetching, setFetching] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [normalizedLocale, setNormalizedLocale] = React.useState(navigator.language.replace('_', '-'));
  const [messages, setMessages] = React.useState<LocaleJson>({});
  const [fallbackOnEmptyLocaleString, setFallbackOnEmptyLocaleString] = React.useState(false);
  const skipInitialLocaleFetch = React.useRef(true);

  const fetchLocalizedMessages = useCallback((locale: string, init: boolean, signal: AbortSignal) => {
    setFetching(true);
    setHasError(false);
    // Single budget shared across the index fetch and every language-set fetch of
    // this load, so the whole load is bounded by MAX_RETRY_DURATION rather than
    // each fetch getting its own (which could stack to ~2x in the worst case).
    const deadline = Date.now() + MAX_RETRY_DURATION;
    buildFetchLocale<LocaleIndexEntry[]>('index', signal, deadline)
      .then((resp) => {
        if (signal.aborted) return;
        // The index fetch fell back to false (e.g. 404, corrupt index.json, or the
        // retry budget was exhausted): there is no locale list to work from, so
        // surface the error screen instead of crashing on .map or spinning on a
        // blank screen.
        if (!Array.isArray(resp)) {
          setHasError(true);
          setFetching(false);
          return;
        }
        const data = fetchLocaleOptions(
          locale,
          init,
          resp.map((l) => l.name),
        );

        const {
          defaultLocale,
          regionDefaultLocale,
          normalizedLocale,
          fallbackOnEmptyLocaleString: FOEL,
        } = data;
        setFallbackOnEmptyLocaleString(FOEL);
        const languageSets = Array.from(new Set([
          defaultLocale,
          regionDefaultLocale,
          normalizedLocale,
        ])).filter((locale) => locale);

        Promise.all(languageSets.map((locale) => buildFetchLocale(locale, signal, deadline)))
          .then((resp) => {
            if (signal.aborted) return;
            const foundLocales = resp.filter((locale): locale is LocaleJson => locale !== false);
            if (foundLocales.length === 0) {
              logger.error({ logCode: 'intl_fetch_locale_none_error', extraInfo: { languageSets } }, 'Could not fetch any locale file');
              setHasError(true);
              setFetching(false);
              return;
            }
            const mergedLocale = foundLocales
              .reduce((acc, locale: LocaleJson) => Object.assign(acc, locale), {});
            const replacedLocale = normalizedLocale.replace('_', '-');
            setNormalizedLocale(replacedLocale);
            setCurrentLocale(replacedLocale);
            setMessages(mergedLocale);
            setFetching(false);
          }).catch((error) => {
            logger.error(
              {
                logCode: 'intl_fetch_locale_merge_error',
                extraInfo: { error: error instanceof Error ? error.message : String(error) },
              },
              'Error fetching localized messages',
            );
            setHasError(true);
            setFetching(false);
          });
      })
      .catch((error) => {
        logger.error(
          {
            logCode: 'intl_fetch_locale_index_error',
            extraInfo: { error: error instanceof Error ? error.message : String(error) },
          },
          'Unable to fetch localized messages',
        );
        setHasError(true);
        setFetching(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const language = navigator.languages ? navigator.languages[0] : navigator.language;
    // if currentLocale was already overridden before this component mounted, use it instead
    if (currentLocale !== normalizedLocale) {
      fetchLocalizedMessages(currentLocale, false, controller.signal);
    } else {
      fetchLocalizedMessages(language, true, controller.signal);
    }
    // Aborts any in-flight fetch and clears a pending retry timeout on unmount.
    return () => controller.abort();
  }, []);

  useEffect(() => {
    // Skip first run since initial locale is already fetched in the previous useEffect
    // Prevents redundant initial locale fetches when a locale override is detected at mount time
    if (skipInitialLocaleFetch.current) {
      skipInitialLocaleFetch.current = false;
      return undefined;
    }
    if (currentLocale !== normalizedLocale) {
      const controller = new AbortController();
      fetchLocalizedMessages(currentLocale, false, controller.signal);
      return () => controller.abort();
    }
    return undefined;
  }, [currentLocale]);

  useEffect(() => {
    if (fetching) {
      logger.info(
        {
          logCode: 'LOCALE_FETCH_INIT',
          extraInfo: {
            requestedLocale: currentLocale,
          },
        },
        'Fetching locale',
      );
    }
  }, [fetching]);

  const hasMessages = Object.keys(messages).length > 0;

  // Three render states: (1) locale loading failed completely and we have nothing
  // to show -> ErrorScreen (its named export guards for a null intl and falls back
  // to hardcoded English, so it is safe outside IntlProvider); (2) still fetching
  // with no messages yet -> LoadingScreen; (3) done or we already have a usable
  // locale -> render the app. A failed locale *switch* keeps the working app up
  // (hasMessages is true), so ErrorScreen only ever replaces a blank screen.
  if (hasError && !hasMessages) {
    return <ErrorScreen />;
  }

  return !fetching || hasMessages ? (
    <IntlProvider
      fallbackOnEmptyString={fallbackOnEmptyLocaleString}
      locale={normalizedLocale.replace('_', '-').replace('@', '-')}
      messages={messages}
    >
      {children}
    </IntlProvider>
  ) : <LoadingScreen />;
};

const IntlLoaderContainer: React.FC<IntlLoaderContainerProps> = ({
  children,
}) => {
  const [currentLocale, setCurrentLocale] = useCurrentLocale();
  return (
    <IntlLoader
      currentLocale={currentLocale}
      setCurrentLocale={setCurrentLocale}
    >
      {children}
    </IntlLoader>
  );
};

export default IntlLoaderContainer;
