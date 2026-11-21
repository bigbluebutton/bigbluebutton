import meetingStaticData from '/imports/ui/core/singletons/meetingStaticData';

interface VirtualBackgroundAvailability {
  isVirtualBackgroundsEnabled: boolean;
  isCustomVirtualBackgroundsEnabled: boolean;
}

/**
 * Same rules as services/features' useIsVirtualBackgroundsEnabled, but read from
 * meetingStaticData: pre-join the user holds bbb_client_not_in_meeting, which has
 * no select permission on the views useDisabledFeatures subscribes to.
 */
const getVirtualBackgroundAvailability = (): VirtualBackgroundAvailability => {
  const disabledFeatures = meetingStaticData.getMeetingData()?.disabledFeatures ?? [];

  return {
    isVirtualBackgroundsEnabled: !disabledFeatures.includes('virtualBackgrounds')
      && window.meetingClientSettings.public.virtualBackgrounds.enabled,
    isCustomVirtualBackgroundsEnabled: !disabledFeatures.includes('customVirtualBackgrounds'),
  };
};

export default getVirtualBackgroundAvailability;
