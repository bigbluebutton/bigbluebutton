import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import { notify } from '/imports/ui/services/notification';
import { isMobile } from '/imports/utils/deviceInfo';
import useActiveHint from '/imports/ui/components/smart-triggers/hooks/useActiveHint';
import { dismissHint } from '/imports/ui/components/smart-triggers/service';
import Styled from './styles';

const intlMessages = defineMessages({
  disableMessage: {
    id: 'app.muteWarning.disableMessage',
    description: 'Message used when mute alerts has been disabled',
  },
  warningLabel: {
    id: 'app.muteWarning.label',
    description: 'Warning when someone speaks while muted',
  },
  unmuteAudio: {
    id: 'app.actionsBar.unmuteLabel',
    description: 'Unmute audio button label',
  },
});

const MutedAlert: React.FC = () => {
  const intl = useIntl();
  const hint = useActiveHint('talkingWhileMuted');

  if (!hint) return null;

  const unmuteIcon = (
    <>
      <span className="sr-only">{intl.formatMessage(intlMessages.unmuteAudio)}</span>
      <Icon iconName="mute" aria-hidden="true" />
    </>
  );

  return (
    <TooltipContainer title={hint.message} position="top">
      <Styled.MuteWarning
        data-test="mutedAlert"
        onClick={(e: React.MouseEvent) => {
          // Keep the click from reaching the audio options menu trigger
          e.stopPropagation();
          dismissHint('talkingWhileMuted');
          notify(intl.formatMessage(intlMessages.disableMessage), 'info', 'mute');
        }}
        $mobile={isMobile}
      >
        <span>
          {intl.formatMessage(intlMessages.warningLabel, { unmuteIcon })}
        </span>
      </Styled.MuteWarning>
    </TooltipContainer>
  );
};

export default MutedAlert;
