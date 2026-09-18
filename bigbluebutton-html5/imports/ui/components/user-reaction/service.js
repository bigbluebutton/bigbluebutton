import { useIsReactionsEnabled } from '/imports/ui/services/features/index';

const getEnabledSetting = () => window.meetingClientSettings.public.userReaction.enabled;

const useIsEnabled = () => useIsReactionsEnabled() && getEnabledSetting();

export default {
  useIsEnabled,
};
