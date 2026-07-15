import React, { useCallback, useContext, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { LoadingContext } from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
import useCurrentLocale from '/imports/ui/core/local-states/useCurrentLocale';
import logger from './logger';

// Backoff between locale fetch retries: 1s, 2s, then 5s repeated. A network
// rejection (e.g. ERR_NETWORK_CHANGED) retries indefinitely until it succeeds
// or the component unmounts (the fetch is aborted); the client must never be
// left on a blank screen because a transient network blip dropped the locale.
const RETRY_DELAYS = [1000, 2000, 5000];

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

// Waits `ms` before resolving, but resolves early if the signal aborts. If the
// signal is already aborted when called, resolve synchronously without arming a
// timeout. The abort listener is always detached: on normal completion the
// setTimeout callback removes it, and on abort the once:true listener has
// already fired. This prevents listeners from piling up across retries on a
// long-lived signal.
const waitForDelay = (ms: number, signal: AbortSignal): Promise<void> => new Promise((resolve) => {
  if (signal.aborted) {
    resolve();
    return;
  }
  const onAbort = () => {
    clearTimeout(timer);
    resolve();
  };
  const timer = setTimeout(() => {
    signal.removeEventListener('abort', onAbort);
    resolve();
  }, ms);
  signal.addEventListener('abort', onAbort, { once: true });
});

const buildFetchLocale = (locale: string, signal: AbortSignal): Promise<unknown> => {
  const clientVersion = window.meetingClientSettings.public.app.html5ClientBuild;
  const localesPath = 'locales';
  const url = `${localesPath}/${locale !== 'index' ? `${locale}.json?v=${clientVersion}` : ''}`;

  const attempt = (retryCount: number): Promise<unknown> => fetch(url, { signal })
    .then((response) => {
      // A genuine HTTP error (e.g. 404 for a locale that does not exist) is a
      // legitimate fallback, not a transient failure: resolve false so the
      // merge step falls back to another locale. Retrying would never help.
      if (!response.ok) {
        return false;
      }
      return response.json()
        .then((jsonResponse) => jsonResponse)
        .catch(() => {
          logger.error({ logCode: 'intl_parse_locale_SyntaxError' }, `Could not parse locale file ${locale}.json, invalid json`);
          return false;
        });
    })
    .catch((error) => {
      // The fetch itself rejected (network down/changed -> TypeError: Failed to
      // fetch). Retry with backoff until the network recovers, unless the
      // component has unmounted (signal aborted).
      if (signal.aborted) {
        return false;
      }
      const delay = RETRY_DELAYS[Math.min(retryCount, RETRY_DELAYS.length - 1)];
      logger.warn(
        {
          logCode: 'intl_fetch_locale_retry',
          extraInfo: {
            locale,
            retryCount,
            delay,
            error: error?.message,
          },
        },
        `Locale fetch failed for ${locale}, retrying in ${delay}ms`,
      );
      return waitForDelay(delay, signal).then(() => {
        // The delay may have resolved early because the signal aborted while we
        // were waiting. Skip the extra fetch (it would only reject) and fall
        // back instead.
        if (signal.aborted) {
          return false;
        }
        return attempt(retryCount + 1);
      });
    });

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
  const loadingContextInfo = useContext(LoadingContext);

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
              const error = `${{ logCode: 'intl_fetch_locale_error' }},Could not fetch any locale file for ${languageSets.join(', ')}`;
              loadingContextInfo.setLoading(false);
              logger.error(error);
              throw new Error(error);
            }
            const mergedLocale = foundLocales
              .reduce((acc, locale: LocaleJson) => Object.assign(acc, locale), {});
            const replacedLocale = normalizedLocale.replace('_', '-');
            setNormalizedLocale(replacedLocale);
            setCurrentLocale(replacedLocale);
            setMessages(mergedLocale);
            if (!init) {
              loadingContextInfo.setLoading(false);
            }
          }).catch((error) => {
            loadingContextInfo.setLoading(false);
            throw new Error(error);
          });
      })
      .catch(() => {
        loadingContextInfo.setLoading(false);
        throw new Error('unable to fetch localized messages');
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
