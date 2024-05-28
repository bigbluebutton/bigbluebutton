import getFromUserSettings from '/imports/ui/services/users-settings';
import { isReactionsEnabled, useIsReactionsEnabled } from '/imports/ui/services/features/index';

const getEnabledSetting = () => window.meetingClientSettings.public.userReaction.enabled;

const isEnabled = () => isReactionsEnabled() && getFromUserSettings('enable-user-reaction', getEnabledSetting());

const useIsEnabled = () => useIsReactionsEnabled() && getFromUserSettings('enable-user-reaction', getEnabledSetting());

export default {
  isEnabled,
  useIsEnabled,
};
