import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.node.isRequired,
  confirmLabel: PropTypes.string.isRequired,
  denyLabel: PropTypes.string.isRequired,
  denyLabelMobile: PropTypes.string,
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
  denyLabelMobile = null,
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

  const [isSmallViewport, setIsSmallViewport] = useState(
    // eslint-disable-next-line no-undef
    () => globalThis.matchMedia(smallOnly).matches,
  );

  useEffect(() => {
    // eslint-disable-next-line no-undef
    const mediaQuery = globalThis.matchMedia(smallOnly);
    const handleChange = (event) => setIsSmallViewport(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const effectiveDenyLabel = (isSmallViewport && denyLabelMobile)
    ? denyLabelMobile
    : denyLabel;

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
        <BBButton
          label={confirmLabel}
          dataTest={confirmDataTest}
          iconStart={<Icon iconName={confirmIcon} />}
          onClick={onConfirm}
          variant="primary"
          color="default"
        />
        <BBButton
          label={effectiveDenyLabel}
          dataTest={denyDataTest}
          iconStart={<Icon iconName={denyIcon} />}
          onClick={onDeny}
          variant="secondary"
          color="danger"
        />
      </Styled.RequestModalContent>
    </Styled.RequestModal>
  );
};

MediaConsentModal.propTypes = propTypes;

export default MediaConsentModal;
