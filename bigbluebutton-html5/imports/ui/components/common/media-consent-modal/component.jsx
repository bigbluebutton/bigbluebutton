import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';

const propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.node.isRequired,
  confirmLabel: PropTypes.string.isRequired,
  denyLabel: PropTypes.string.isRequired,
  confirmIcon: PropTypes.string.isRequired,
  denyIcon: PropTypes.string.isRequired,
  confirmDataTest: PropTypes.string.isRequired,
  denyDataTest: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onDeny: PropTypes.func.isRequired,
};

// Prompt asking the user to turn a device on at a moderator's request.
// Shared by request-unmute-modal and request-camera-modal.
const MediaConsentModal = ({
  title,
  subtitle,
  confirmLabel,
  denyLabel,
  confirmIcon,
  denyIcon,
  confirmDataTest,
  denyDataTest,
  onConfirm,
  onDeny,
}) => {
  useEffect(() => {
    const { cdn, basename } = window.meetingClientSettings.public.app;
    const alert = new Audio(`${cdn + basename}/resources/sounds/notify.mp3`);
    // The prompt is not user-initiated, so autoplay may be blocked.
    alert.play().catch(() => {});
  }, []);

  return (
    <Styled.RequestModal
      isOpen
      priority="high"
      title={title}
      onRequestClose={onDeny}
      shouldShowCloseButton
    >
      <Styled.Subtitle>
        {subtitle}
      </Styled.Subtitle>
      <Styled.RequestModalContent>
        <Styled.RequestModalButton
          label={confirmLabel}
          data-test={confirmDataTest}
          icon={confirmIcon}
          onClick={onConfirm}
          color="primary"
        />
        <Styled.RequestModalButton
          label={denyLabel}
          data-test={denyDataTest}
          icon={denyIcon}
          onClick={onDeny}
          color="danger"
          ghost
        />
      </Styled.RequestModalContent>
    </Styled.RequestModal>
  );
};

MediaConsentModal.propTypes = propTypes;

export default MediaConsentModal;
