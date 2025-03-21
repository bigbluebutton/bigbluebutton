import React, { useEffect } from 'react';
import { MeetingStatusData } from 'bigbluebutton-html-plugin-sdk';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { GENERIC_HOOK_PLUGIN, HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { PluginTopLevelManagerProps } from './types';
import { useStatePreviousValue } from '../../hooks/usePreviousValue';

/**
 * This component manages plugin events and states in a top-level scope
 */
const PluginTopLevelManager: React.FC<PluginTopLevelManagerProps> = (
  { currentUserCurrentlyInMeeting }: PluginTopLevelManagerProps,
) => {
  const previousUserCurrentlyInMeeting = useStatePreviousValue(currentUserCurrentlyInMeeting);

  useEffect(() => {
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
  }, [previousUserCurrentlyInMeeting, currentUserCurrentlyInMeeting]);

  return null;
};

export default PluginTopLevelManager;
