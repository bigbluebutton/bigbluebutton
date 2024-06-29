import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import { notify } from '/imports/ui/services/notification';
import intlHolder from '../../core/singletons/intlHolder';

const isKeepPushingLayoutEnabled = () => window.meetingClientSettings.public.layout.showPushLayoutToggle;

const updateSettings = (obj, msgDescriptor, mutation) => {
  const Settings = getSettingsSingletonInstance();
  Object.keys(obj).forEach(k => (Settings[k] = obj[k]));
  Settings.save(mutation);

  if (msgDescriptor) {
    // prevents React state update on unmounted component
    setTimeout(() => {
      const intl = intlHolder.getIntl();
      notify(
        intl.formatMessage(msgDescriptor),
        'info',
        'settings',
      );
    }, 0);
  }
};

const getAvailableLocales = () => fetch('./locale-list').then(locales => locales.json());

export {
  updateSettings,
  isKeepPushingLayoutEnabled,
  getAvailableLocales,
};
