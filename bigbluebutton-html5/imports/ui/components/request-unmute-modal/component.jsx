import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import MediaConsentModal from '/imports/ui/components/common/media-consent-modal/component';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

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

  const denyLabel = isSmallViewport
    ? intl.formatMessage(intlMessages.denyButtonLabelMobile)
    : intl.formatMessage(intlMessages.denyButtonLabel);

  return (
    <MediaConsentModal
      title={intl.formatMessage(intlMessages.modalTitle)}
      subtitle={<FormattedMessage {...intlMessages.modalSubtitle} />}
      confirmLabel={intl.formatMessage(intlMessages.confirmButtonLabel)}
      denyLabel={denyLabel}
      confirmIcon="unmute"
      denyIcon="mute"
      confirmDataTest="confirmUnmute"
      denyDataTest="denyUnmute"
      onConfirm={handleConfirm}
      onDeny={handleDeny}
    />
  );
};

RequestUnmuteComponent.propTypes = propTypes;

export default RequestUnmuteComponent;
