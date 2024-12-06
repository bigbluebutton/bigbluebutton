import React from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { useMutation } from '@apollo/client';
import logger from '/imports/startup/client/logger';
import { SET_MUTED } from '../user-list-graphql/user-participants-title/user-options-dropdown/mutations';
import { CrowdActionButtonsProps } from './types';
import Styled from './styles';

const intlMessages = defineMessages({
  muteAllLabel: {
    id: 'app.userList.userOptions.muteAllLabel',
    description: 'Mute all label',
  },
  muteAllDesc: {
    id: 'app.userList.userOptions.muteAllDesc',
    description: 'Mute all description',
  },
});

const CrowdActionButtons: React.FC<CrowdActionButtonsProps> = () => {
  const intl = useIntl();
  const [setMuted] = useMutation(SET_MUTED);

  const muteAll = () => {
    setMuted({
      variables: {
        muted: false,
        exceptPresenter: false,
      },
    });

    return logger.info(
      {
        logCode: 'useroptions_mute_all',
        extraInfo: { logType: 'moderator_action' },
      },
      'moderator enabled meeting mute, all users muted',
    );
  };

  return (
    <Styled.ActionButtonsWrapper>
      <Styled.ActionButtonWrapper>
        <Styled.ActionButtonLabel>
          {intl.formatMessage(intlMessages.muteAllLabel)}
        </Styled.ActionButtonLabel>
        {/* @ts-ignore - button is js component */}
        <Styled.ActionButton
          icon="mute"
          size="lg"
          data-test="muteAllUsers"
          onClick={muteAll}
        />
      </Styled.ActionButtonWrapper>
    </Styled.ActionButtonsWrapper>
  );
};

export default CrowdActionButtons;
