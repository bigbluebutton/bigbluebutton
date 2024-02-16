import React, { useContext, useEffect } from 'react';
import { useIntl } from 'react-intl';
import Settings from '/imports/ui/services/settings';
import { Session } from 'meteor/session';
import { formatLocaleCode } from '/imports/utils/string-utils';
import Intl from '/imports/ui/services/locale';
import useCurrentLocale from '/imports/ui/core/local-states/useCurrentLocale';
import { LoadingContext } from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';

const RTL_LANGUAGES = ['ar', 'dv', 'fa', 'he'];
const LARGE_FONT_LANGUAGES = ['te', 'km'];

interface IntlAdapterProps {
  children: React.ReactNode;
}

const IntlAdapter: React.FC<IntlAdapterProps> = ({
  children,
}) => {
  const [currentLocale] = useCurrentLocale();
  const intl = useIntl();
  const loadingContextInfo = useContext(LoadingContext);
  const setUp = () => {
    if (currentLocale) {
      const { language, formattedLocale } = formatLocaleCode(currentLocale);
      // @ts-ignore - JS code
      Settings.application.locale = currentLocale;
      Intl.setLocale(formattedLocale, intl.messages);
      if (RTL_LANGUAGES.includes(currentLocale.substring(0, 2))) {
        // @ts-ignore - JS code
        document.body.parentNode.setAttribute('dir', 'rtl');
        // @ts-ignore - JS code
        Settings.application.isRTL = true;
      } else {
        // @ts-ignore - JS code
        document.body.parentNode.setAttribute('dir', 'ltr');
        // @ts-ignore - JS code
        Settings.application.isRTL = false;
      }
      Session.set('isLargeFont', LARGE_FONT_LANGUAGES.includes(currentLocale.substring(0, 2)));
      document.getElementsByTagName('html')[0].lang = formattedLocale;
      document.body.classList.add(`lang-${language}`);
      Settings.save();
    }
  };

  useEffect(setUp, []);
  useEffect(setUp, [currentLocale]);
  return !loadingContextInfo.isLoading ? children : null;
};

export default IntlAdapter;
