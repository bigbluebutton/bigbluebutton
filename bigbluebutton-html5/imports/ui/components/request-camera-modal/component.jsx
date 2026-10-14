import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import MediaConsentModal from '/imports/ui/components/common/media-consent-modal/component';

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
}) => (
  <MediaConsentModal
    title={intl.formatMessage(intlMessages.modalTitle)}
    subtitle={<FormattedMessage {...intlMessages.modalSubtitle} />}
    confirmLabel={intl.formatMessage(intlMessages.confirmButtonLabel)}
    denyLabel={intl.formatMessage(intlMessages.denyButtonLabel)}
    confirmIcon="video"
    denyIcon="video_off"
    confirmDataTest="confirmShareCamera"
    denyDataTest="denyShareCamera"
    onConfirm={handleConfirm}
    onDeny={handleDeny}
  />
);

RequestCameraComponent.propTypes = propTypes;

export default RequestCameraComponent;
