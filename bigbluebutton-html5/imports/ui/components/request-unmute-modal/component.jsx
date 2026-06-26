import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import Styled from './styles';
import deviceInfo from '/imports/utils/deviceInfo';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  handleConfirm: PropTypes.func.isRequired,
  handleDeny: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  modalTitle: {
    id: 'app.unmute.modal.title',
    description: 'Title for the unmute request modal',
  },
  modalSubtitle: {
    id: 'app.unmute.modal.subtitle',
    description: 'Subtitle for the unmute request modal',
  },
  confirmButtonLabel: {
    id: 'app.unmute.modal.confirm.label',
    description: 'Label for the unmute confirmation button',
  },
  denyButtonLabel: {
    id: 'app.unmute.modal.deny.label',
    description: 'Label for the unmute denial button',
  },
  denyButtonLabelMobile: {
    id: 'app.unmute.modal.deny.label.mobile',
    description: 'Label for the unmute denial button on mobile',
  },
});

const RequestUnmuteComponent = ({
  intl,
  handleConfirm,
  handleDeny,
}) => {
  useEffect(() => {
    const alert = new Audio(`${window.meetingClientSettings.public.app.cdn + window.meetingClientSettings.public.app.basename}/resources/sounds/notify.mp3`);
    alert.play();
  }, []);

  const denyLabel = deviceInfo.isMobile
    ? intl.formatMessage(intlMessages.denyButtonLabelMobile)
    : intl.formatMessage(intlMessages.denyButtonLabel);

  return (
    <Styled.RequestModal
      isOpen
      priority="high"
      title={intl.formatMessage(intlMessages.modalTitle)}
      onRequestClose={handleDeny}
      shouldShowCloseButton
    >
      <Styled.Subtitle>
        <FormattedMessage {...intlMessages.modalSubtitle} />
      </Styled.Subtitle>
      <Styled.RequestModalContent>
        <Styled.RequestModalButton
          label={intl.formatMessage(intlMessages.confirmButtonLabel)}
          data-test="confirmUnmute"
          icon="unmute"
          onClick={handleConfirm}
          color="primary"
        />
        <Styled.RequestModalButton
          label={denyLabel}
          data-test="denyUnmute"
          icon="mute"
          onClick={handleDeny}
          color="danger"
          ghost
        />
      </Styled.RequestModalContent>
    </Styled.RequestModal>
  );
};

RequestUnmuteComponent.propTypes = propTypes;

export default RequestUnmuteComponent;
