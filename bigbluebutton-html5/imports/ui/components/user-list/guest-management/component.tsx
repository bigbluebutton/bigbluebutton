import React from 'react';
import { MessageDescriptor, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import { MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Styled from './styles';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { SET_POLICY } from '../../waiting-users/mutations';
import { notify } from '/imports/ui/services/notification';
import GuestUsersManagementPanel from './waiting-users/component';

const ASK_MODERATOR = 'ASK_MODERATOR';
const ALWAYS_ACCEPT = 'ALWAYS_ACCEPT';
const ALWAYS_DENY = 'ALWAYS_DENY';

const intlMessages: Record<string, { id: string; description: string }> = {
  guestPolicyLabel: {
    id: 'app.userList.userOptions.guestPolicyLabel',
    description: 'Guest policy label',
  },
  askModerator: {
    id: 'app.guest-policy.button.askModerator',
    description: 'Ask moderator button label',
  },
  alwaysAccept: {
    id: 'app.guest-policy.button.alwaysAccept',
    description: 'Always accept button label',
  },
  alwaysDeny: {
    id: 'app.guest-policy.button.alwaysDeny',
    description: 'Always deny button label',
  },
  feedbackMessage: {
    id: 'app.guest-policy.feedbackMessage',
    description: 'Feedback message for guest policy change',
  },
};

interface GuestManagementProps {
}

const GuestManagement: React.FC<GuestManagementProps> = () => {
  const intl = useIntl();
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));

  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    usersPolicies: m.usersPolicies,
  }));

  const amIModerator = currentUserData?.isModerator;

  const [setPolicy] = useMutation(SET_POLICY);

  const changeGuestPolicy = (guestPolicy: string) => {
    setPolicy({
      variables: {
        guestPolicy,
      },
    });
  };

  const guestPolicy = currentMeeting?.usersPolicies?.guestPolicy;

  const handleChangePolicy = (policyRule: string, messageId: MessageDescriptor) => {
    changeGuestPolicy(policyRule);
    notify(intl.formatMessage(intlMessages.feedbackMessage) + intl.formatMessage(messageId), 'success');
  };

  return amIModerator && (
    <Styled.GuestManagement>
      <Styled.GuestPolicyContainer>
        <Styled.GuestPolicyText>
          {intl.formatMessage(intlMessages.guestPolicyLabel)}
        </Styled.GuestPolicyText>
        <Styled.GuestPolicySelector value={guestPolicy} IconComponent={ExpandMoreIcon}>
          <MenuItem
            value={ASK_MODERATOR}
            disabled={guestPolicy === ASK_MODERATOR}
            onClick={() => {
              handleChangePolicy(ASK_MODERATOR, intlMessages.askModerator);
            }}
            data-test="askModerator"
          >
            {intl.formatMessage(intlMessages.askModerator)}
          </MenuItem>
          <MenuItem
            value={ALWAYS_ACCEPT}
            disabled={guestPolicy === ALWAYS_ACCEPT}
            onClick={() => {
              handleChangePolicy(ALWAYS_ACCEPT, intlMessages.alwaysAccept);
            }}
            data-test="alwaysAccept"
          >
            {intl.formatMessage(intlMessages.alwaysAccept)}
          </MenuItem>
          <MenuItem
            value={ALWAYS_DENY}
            disabled={guestPolicy === ALWAYS_DENY}
            onClick={() => {
              handleChangePolicy(ALWAYS_DENY, intlMessages.alwaysDeny);
            }}
            data-test="alwaysDeny"
          >
            {intl.formatMessage(intlMessages.alwaysDeny)}
          </MenuItem>
        </Styled.GuestPolicySelector>
      </Styled.GuestPolicyContainer>
      <GuestUsersManagementPanel />
    </Styled.GuestManagement>
  );
};

export default GuestManagement;
