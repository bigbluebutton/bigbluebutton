import React from "react";
import { useShortcutHelp } from "/imports/ui/core/hooks/useShortcutHelp";
import { defineMessages, useIntl } from "react-intl";
import Button from "/imports/ui/components/common/button/component";

const intlMessages = defineMessages({
  leaveAudio: {
    id: 'app.audio.leaveAudio',
    description: 'Leave audio dropdown item label',
  },
});

interface ListenOnlyProps {
  listenOnly: boolean;
  handleLeaveAudio: (meetingIsBreakout: boolean) => void;
  meetingIsBreakout: boolean;
}

export const ListenOnly: React.FC<ListenOnlyProps> = ({
  listenOnly,
  handleLeaveAudio,
  meetingIsBreakout,
}) => {
  const intl = useIntl();
  const leaveAudioShourtcut = useShortcutHelp('leaveAudio');
  return (<Button
    aria-label={intl.formatMessage(intlMessages.leaveAudio)}
    label={intl.formatMessage(intlMessages.leaveAudio)}
    accessKey={leaveAudioShourtcut}
    data-test="leaveListenOnly"
    hideLabel
    color="primary"
    icon={listenOnly ? 'listen' : 'volume_level_2'}
    size="lg"
    circle
    onClick={(e) => {
      e.stopPropagation();
      handleLeaveAudio(meetingIsBreakout);
    }}
  />)
};

export default ListenOnly;