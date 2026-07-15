import React, { useCallback, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
import useCurrentLocale from '/imports/ui/core/local-states/useCurrentLocale';
import logger from './logger';

// Backoff between locale fetch retries: 1s, 2s, then 5s repeated, each with up
// to 500ms of random jitter to avoid a thundering herd of clients retrying in
// lockstep after a shared network blip. A network rejection (e.g.
// ERR_NETWORK_CHANGED) keeps retrying until it succeeds, the component unmounts
// (the fetch is aborted), or the total retry time exceeds MAX_RETRY_DURATION.
// The client must never be left on a blank screen because a transient network
// blip dropped the locale.
const RETRY_DELAYS = [1000, 2000, 5000];
// Mirrors CustomUsersSettings' CONNECTION_TIMEOUT (the parent in client/main.tsx):
// stop retrying after this long and let the failure propagate so the loading
// state resolves instead of spinning forever.
const MAX_RETRY_DURATION = 60000;

interface LocaleJson {
  [key: string]: string;
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

const buildFetchLocale = (locale: string, signal: AbortSignal): Promise<unknown> => {
  const clientVersion = window.meetingClientSettings.public.app.html5ClientBuild;
  const url = `locales/${locale !== 'index' ? `${locale}.json?v=${clientVersion}` : ''}`;
  const startTime = Date.now();

  const attempt = async (retryCount: number): Promise<unknown> => {
    try {
      const response = await fetch(url, { signal });
      // A genuine HTTP error (e.g. 404 for a locale that does not exist) is a
      // legitimate fallback, not a transient failure: resolve false so the merge
      // step falls back to another locale. Retrying would never help.
      if (!response.ok) return false;
      return await response.json();
    } catch (error) {
      // The component unmounted mid-flight: stop, do not retry.
      if (signal.aborted) return false;
      // Malformed JSON is not transient (the file is served but corrupt), so
      // retrying is pointless. Fall back to another locale.
      if (error instanceof SyntaxError) {
        logger.error({ logCode: 'intl_parse_locale_SyntaxError' }, `Could not parse locale file ${locale}.json, invalid json`);
        return false;
      }
      // The fetch itself rejected (network down/changed -> TypeError: Failed to
      // fetch). Retry with backoff until the network recovers, unless we have
      // already spent MAX_RETRY_DURATION trying: then let the failure propagate.
      if (Date.now() - startTime > MAX_RETRY_DURATION) throw error;
      const delay = RETRY_DELAYS[Math.min(retryCount, RETRY_DELAYS.length - 1)] + Math.random() * 500;
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
        `Locale fetch failed for ${locale}, retrying in ${delay}ms`,
      );
      // waitForDelay resolves false when the signal aborted before or during the
      // wait; skip the doomed next fetch and fall back instead.
      const completed = await waitForDelay(delay, signal);
      if (!completed) return false;
      return attempt(retryCount + 1);
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
  const [normalizedLocale, setNormalizedLocale] = React.useState(navigator.language.replace('_', '-'));
  const [messages, setMessages] = React.useState<LocaleJson>({});
  const [fallbackOnEmptyLocaleString, setFallbackOnEmptyLocaleString] = React.useState(false);
  const skipInitialLocaleFetch = React.useRef(true);

  const fetchLocalizedMessages = useCallback((locale: string, init: boolean, signal: AbortSignal) => {
    setFetching(true);
    buildFetchLocale('index', signal)
      .then((resp) => {
        if (signal.aborted) return;
        // The index fetch fell back to false (e.g. 404 or corrupt index.json):
        // there is no locale list to work from, so resolve the loading state
        // instead of crashing on .map or spinning on a blank screen.
        if (!Array.isArray(resp)) {
          setFetching(false);
          return;
        }
        const data = fetchLocaleOptions(
          locale,
          init,
          (resp as { name: string }[]).map((l) => l.name),
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

        Promise.all(languageSets.map((locale) => buildFetchLocale(locale, signal)))
          .then((resp) => {
            if (signal.aborted) return;
            const typedResp = resp as Array<LocaleJson | boolean>;
            const foundLocales = typedResp.filter((locale) => locale instanceof Object) as LocaleJson[];
            if (foundLocales.length === 0) {
              logger.error({ logCode: 'intl_fetch_locale_error', extraInfo: { languageSets } }, 'Could not fetch any locale file');
              setFetching(false);
              return;
            }
            const mergedLocale = foundLocales
              .reduce((acc, locale: LocaleJson) => Object.assign(acc, locale), {});
            const replacedLocale = normalizedLocale.replace('_', '-');
            setNormalizedLocale(replacedLocale);
            setCurrentLocale(replacedLocale);
            setMessages(mergedLocale);
            if (!init) {
              setFetching(false);
            }
          }).catch((error) => {
            logger.error(
              {
                logCode: 'intl_fetch_locale_error',
                extraInfo: { error: error instanceof Error ? error.message : String(error) },
              },
              'Error fetching localized messages',
            );
            setFetching(false);
          });
      })
      .catch((error) => {
        logger.error(
          {
            logCode: 'intl_fetch_locale_error',
            extraInfo: { error: error instanceof Error ? error.message : String(error) },
          },
          'Unable to fetch localized messages',
        );
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

  return !fetching || Object.keys(messages).length > 0 ? (
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
