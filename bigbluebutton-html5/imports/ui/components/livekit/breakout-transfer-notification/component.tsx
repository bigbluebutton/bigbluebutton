import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import Button from '/imports/ui/components/common/button/component';

interface BreakoutTransferToastContentProps {
  onReturnToParent: () => void;
  roomName: string;
}

const intlMessages = defineMessages({
  description: {
    id: 'app.createBreakoutRoom.listen.description',
    description: 'Description shown inside the LK breakout-transfer toast',
  },
  terminateLabel: {
    id: 'app.createBreakoutRoom.listen.terminateLabel',
    description: 'Label for the breakout transfer terminate button',
  },
  terminateAria: {
    id: 'app.createBreakoutRoom.listen.terminateAriaLabel',
    description: 'Aria label for the breakout transfer terminate button',
  },
});

const BreakoutTransferToastContent: React.FC<BreakoutTransferToastContentProps> = ({
  onReturnToParent,
  roomName,
}) => {
  const intl = useIntl();

  return (
    <Styled.Body data-test="breakoutListenToast" data-room-name={roomName}>
      <Styled.Description>
        {intl.formatMessage(intlMessages.description)}
      </Styled.Description>
      <Button
        color="primary"
        size="md"
        dataTest="breakoutTransferReturnButton"
        aria-label={intl.formatMessage(intlMessages.terminateAria)}
        label={intl.formatMessage(intlMessages.terminateLabel)}
        onClick={onReturnToParent}
      />
    </Styled.Body>
  );
};

export default BreakoutTransferToastContent;
