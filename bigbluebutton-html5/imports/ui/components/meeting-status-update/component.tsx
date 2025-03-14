import React from 'react';
import { MeetingStatusData } from 'bigbluebutton-html-plugin-sdk';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { GENERIC_HOOK_PLUGIN, HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { MeetingStatusUpdateForPluginProps } from './types';
import { useStatePreviousValue } from '../../hooks/usePreviousValue';

const MeetingStatusUpdateForPlugin: React.FC<MeetingStatusUpdateForPluginProps> = (
  { currentUserCurrentlyInMeeting }: MeetingStatusUpdateForPluginProps,
) => {
  const previousUserCurrentlyInMeeting = useStatePreviousValue(currentUserCurrentlyInMeeting);

  if (previousUserCurrentlyInMeeting !== currentUserCurrentlyInMeeting) {
    window.dispatchEvent(new CustomEvent<UpdatedEventDetails<MeetingStatusData>>(
      HookEvents.BBB_CORE_UPDATED_MEETING_STATUS,
      {
        detail: {
          data: {
            userCurrentlyInMeeting: currentUserCurrentlyInMeeting,
          },
          hook: GENERIC_HOOK_PLUGIN,
        },
      },
    ));
  }

  return null;
};

export default MeetingStatusUpdateForPlugin;
