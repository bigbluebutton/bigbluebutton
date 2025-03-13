import { useRef } from 'react';
import { MeetingStatusData } from 'bigbluebutton-html-plugin-sdk';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { GENERIC_HOOK_PLUGIN, HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';

const updateMeetingStatusForPlugin = (currentUserCurrentlyInMeeting: boolean) => {
  const previousUserCurrentlyInMeeting = useRef(true);
  if (previousUserCurrentlyInMeeting.current !== currentUserCurrentlyInMeeting) {
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
};
export default updateMeetingStatusForPlugin;
