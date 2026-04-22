import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
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
  priority: string;
  setIsOpen: (isOpen: boolean) => void;
  isAttemptingAutoplay: boolean;
}

const LKAutoplayModal: React.FC<LKAutoplayModalProps> = ({
  autoplayHandler,
  isOpen,
  onRequestClose,
  priority,
  setIsOpen,
  isAttemptingAutoplay,
}) => {
  const intl = useIntl();

  return (
    <Styled.LKAutoplayModal
      onRequestClose={onRequestClose}
      contentLabel={intl.formatMessage(intlMessages.title)}
      title={intl.formatMessage(intlMessages.title)}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      priority={priority}
      aria-label={intl.formatMessage(intlMessages.title)}
    >
      <Styled.LKAutoplayModalContent>
        <AudioAutoplayPrompt
          handleAllowAutoplay={autoplayHandler}
          disabled={isAttemptingAutoplay}
        />
      </Styled.LKAutoplayModalContent>
    </Styled.LKAutoplayModal>
  );
};

export default React.memo(LKAutoplayModal);
