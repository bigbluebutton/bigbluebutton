import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import { ModalPriority } from '/imports/ui/components/common/modal/generic/component';
import Styled from './styles';
import AudioAutoplayPrompt from '/imports/ui/components/audio/autoplay/component';
import type { AutoplayHandler } from './hooks';

const intlMessages = defineMessages({
  title: {
    id: 'app.audioModal.autoplayBlockedDesc',
    description: 'Message for autoplay audio block',
  },
});

interface LKAutoplayModalProps {
  autoplayHandler: AutoplayHandler;
  isOpen: boolean;
  onRequestClose: () => void;
  priority: ModalPriority;
  isAttemptingAutoplay: boolean;
}

const LKAutoplayModal: React.FC<LKAutoplayModalProps> = ({
  autoplayHandler,
  isOpen,
  onRequestClose,
  priority,
  isAttemptingAutoplay,
}) => {
  const intl = useIntl();

  return (
    <ModalSimple
      onRequestClose={onRequestClose}
      title={intl.formatMessage(intlMessages.title)}
      isOpen={isOpen}
      priority={priority}
    >
      <Styled.LKAutoplayModalContent>
        <AudioAutoplayPrompt
          handleAllowAutoplay={autoplayHandler}
          disabled={isAttemptingAutoplay}
        />
      </Styled.LKAutoplayModalContent>
    </ModalSimple>
  );
};

export default React.memo(LKAutoplayModal);
