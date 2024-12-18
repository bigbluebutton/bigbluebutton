import getFromUserSettings from '/imports/ui/services/users-settings';
import { useIsReactionsEnabled } from '/imports/ui/services/features/index';

const getEnabledSetting = () => window.meetingClientSettings.public.userReaction.enabled;

const useIsEnabled = () => useIsReactionsEnabled() && getFromUserSettings('enable-user-reaction', getEnabledSetting());

export default {
  useIsEnabled,
};
