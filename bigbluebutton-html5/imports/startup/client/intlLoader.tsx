import React, { useCallback, useContext, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { LoadingContext } from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';
import useCurrentLocale from '/imports/ui/core/local-states/useCurrentLocale';
import logger from './logger';

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

const buildFetchLocale = (locale: string) => {
  const clientVersion = window.meetingClientSettings.public.app.html5ClientBuild;
  const localesPath = 'locales';

  return new Promise((resolve) => {
    fetch(`${localesPath}/${locale !== 'index' ? `${locale}.json?v=${clientVersion}` : ''}`)
      .then((response) => {
        if (!response.ok) {
          return resolve(false);
        }
        return response.json()
          .then((jsonResponse) => resolve(jsonResponse))
          .catch(() => {
            logger.error({ logCode: 'intl_parse_locale_SyntaxError' }, `Could not parse locale file ${locale}.json, invalid json`);
            resolve(false);
          });
      });
  });
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

  const fetchLocalizedMessages = useCallback((locale: string, init: boolean) => {
    setFetching(true);
    buildFetchLocale('index')
      .then((resp) => {
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

        Promise.all(languageSets.map((locale) => buildFetchLocale(locale)))
          .then((resp) => {
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
    const language = navigator.languages ? navigator.languages[0] : navigator.language;
    fetchLocalizedMessages(language, true);
  }, []);

  useEffect(() => {
    if (currentLocale !== normalizedLocale) {
      fetchLocalizedMessages(currentLocale, false);
    }
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
  ) : null;
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
