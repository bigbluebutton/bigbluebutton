import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import { notify } from '/imports/ui/services/notification';
import intlHolder from '../../core/singletons/intlHolder';

export const isKeepPushingLayoutEnabled = () => window.meetingClientSettings.public.layout.showPushLayoutToggle;

export const updateSettings = (obj, msgDescriptor, mutation) => {
  const Settings = getSettingsSingletonInstance();
  Object.keys(obj).forEach(k => (Settings[k] = obj[k]));
  Settings.save(mutation);

  if (msgDescriptor) {
    // prevents React state update on unmounted component
    const intl = intlHolder.getIntl();
    notify(
      intl.formatMessage(msgDescriptor),
      'info',
      'settings',
    );
  }
};

export const getAvailableLocales = () => fetch('./locales/')
  .then((locales) => locales.json())
  .then((locales) => locales.filter((locale) => locale.name !== 'index.json'));

export const FALLBACK_LOCALES = {
  dv: {
    englishName: 'Dhivehi',
    nativeName: 'ދިވެހި',
  },
  hy: {
    englishName: 'Armenian',
    nativeName: 'Հայերեն',
  },
  ka: {
    englishName: 'Georgian',
    nativeName: 'ქართული',
  },
  kk: {
    englishName: 'Kazakh',
    nativeName: 'қазақ',
  },
  'lo-LA': {
    englishName: 'Lao',
    nativeName: 'ລາວ',
  },
  oc: {
    englishName: 'Occitan',
    nativeName: 'Occitan',
  },
  'uz@Cyrl': {
    englishName: 'Uzbek (Cyrillic)',
    nativeName: 'ўзбек тили',
  },
};

export default {
  updateSettings,
  isKeepPushingLayoutEnabled,
  getAvailableLocales,
  FALLBACK_LOCALES,
};
