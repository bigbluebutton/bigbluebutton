import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import Styled from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  handleConfirm: PropTypes.func.isRequired,
  handleDeny: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  modalTitle: {
    id: 'app.camera.modal.title',
    description: 'Title for the camera request modal',
  },
  modalSubtitle: {
    id: 'app.camera.modal.subtitle',
    description: 'Subtitle for the camera request modal',
  },
  confirmButtonLabel: {
    id: 'app.camera.modal.confirm.label',
    description: 'Label for the camera confirmation button',
  },
  denyButtonLabel: {
    id: 'app.camera.modal.deny.label',
    description: 'Label for the camera denial button',
  },
});

const RequestCameraComponent = ({
  intl,
  handleConfirm,
  handleDeny,
}) => {
  useEffect(() => {
    const alert = new Audio(`${window.meetingClientSettings.public.app.cdn + window.meetingClientSettings.public.app.basename}/resources/sounds/notify.mp3`);
    alert.play();
  }, []);

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
          data-test="confirmShareCamera"
          icon="video"
          onClick={handleConfirm}
          color="primary"
        />
        <Styled.RequestModalButton
          label={intl.formatMessage(intlMessages.denyButtonLabel)}
          data-test="denyShareCamera"
          icon="video_off"
          onClick={handleDeny}
          color="danger"
          ghost
        />
      </Styled.RequestModalContent>
    </Styled.RequestModal>
  );
};

RequestCameraComponent.propTypes = propTypes;

export default RequestCameraComponent;
