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
});

const RequestUnmuteComponent = ({
  intl,
  handleConfirm,
  handleDeny,
}) => (
  <MediaConsentModal
    title={intl.formatMessage(intlMessages.modalTitle)}
    subtitle={<FormattedMessage {...intlMessages.modalSubtitle} />}
    confirmLabel={intl.formatMessage(intlMessages.confirmButtonLabel)}
    denyLabel={intl.formatMessage(intlMessages.denyButtonLabel)}
    confirmIcon="unmute"
    denyIcon="mute"
    confirmDataTest="confirmUnmute"
    denyDataTest="denyUnmute"
    onConfirm={handleConfirm}
    onDeny={handleDeny}
  />
);

RequestUnmuteComponent.propTypes = propTypes;

export default RequestUnmuteComponent;
