import React, { useEffect, useRef } from 'react';
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
  onPromptShown: () => void;
  onRequestClose: () => void;
  priority: ModalPriority;
  isAttemptingAutoplay: boolean;
}

const LKAutoplayModal: React.FC<LKAutoplayModalProps> = ({
  autoplayHandler,
  isOpen,
  onPromptShown,
  onRequestClose,
  priority,
  isAttemptingAutoplay,
}) => {
  const intl = useIntl();
  const wasOpen = useRef(false);

  // Rendering with isOpen true is the moment the prompt actually reaches the
  // user: the container's render guard passed AND the modal controller granted
  // the slot. Mounting is not that signal - this component also mounts while
  // isOpen is false, before the block is even logged. Edge triggered rather than
  // once per instance so that a prompt hidden by the queue and readmitted counts
  // again: the event means one display, not one episode.
  useEffect(() => {
    if (isOpen && !wasOpen.current) onPromptShown();
    wasOpen.current = isOpen;
  }, [isOpen, onPromptShown]);

  return (
    <ModalSimple
      onRequestClose={onRequestClose}
      title={intl.formatMessage(intlMessages.title)}
      isOpen={isOpen}
      priority={priority}
    >
      <Styled.LKAutoplayModalContent>
        <AudioAutoplayPrompt
          // Pass the source explicitly. AudioAutoplayPrompt wires the button's
          // onClick straight to this prop, so without the wrapper the handler
          // would receive the click event as its first argument. The catch is
          // needed because handleStartAudio rethrows and nothing else consumes
          // this promise; it already logged the failure.
          handleAllowAutoplay={() => autoplayHandler('button').catch(() => {})}
          disabled={isAttemptingAutoplay}
        />
      </Styled.LKAutoplayModalContent>
    </ModalSimple>
  );
};

export default React.memo(LKAutoplayModal);
