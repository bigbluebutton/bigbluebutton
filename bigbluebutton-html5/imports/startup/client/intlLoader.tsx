import React, { useCallback, useContext, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { LoadingContext } from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';
import useCurrentLocale from '/imports/ui/core/local-states/useCurrentLocale';
import logger from './logger';

interface LocaleEndpointResponse {
  defaultLocale: string;
  fallbackOnEmptyLocaleString: boolean;
  normalizedLocale: string;
  regionDefaultLocale: string;
}

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
  const localesPath = 'locales';
  return new Promise((resolve) => {
    fetch(`${localesPath}/${locale}.json`)
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
    const url = `./locale?locale=${locale}&init=${init}`;
    setFetching(true);
    // fetch localized messages
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          loadingContextInfo.setLoading(false, '');
          throw new Error('unable to fetch localized messages');
        }
        return response.json();
      }).then((data: LocaleEndpointResponse) => {
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
              loadingContextInfo.setLoading(false, '');
              logger.error(error);
              throw new Error(error);
            }
            const mergedLocale = foundLocales
              .reduce((acc, locale: LocaleJson) => Object.assign(acc, locale), {});
            const replacedLocale = normalizedLocale.replace('_', '-');
            setFetching(false);
            setNormalizedLocale(replacedLocale);
            setCurrentLocale(replacedLocale);
            setMessages(mergedLocale);
            if (!init) {
              loadingContextInfo.setLoading(false, '');
            }
          }).catch((error) => {
            loadingContextInfo.setLoading(false, '');
            throw new Error(error);
          });
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
      logger.info('Fetching locale');
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
