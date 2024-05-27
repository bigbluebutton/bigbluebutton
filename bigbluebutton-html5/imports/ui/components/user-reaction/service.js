import getFromUserSettings from '/imports/ui/services/users-settings';
import { isReactionsEnabled, useIsReactionsEnabled } from '/imports/ui/services/features/index';

const isEnabled = () => {
  const ENABLED = window.meetingClientSettings.public.userReaction.enabled;
  return isReactionsEnabled() && getFromUserSettings('enable-user-reaction', ENABLED);
};

const useIsEnabled = () => useIsReactionsEnabled() && getFromUserSettings('enable-user-reaction', ENABLED);

export default {
  isEnabled,
  useIsEnabled,
};
