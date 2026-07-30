import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { BBButton } from '@mconf/bbb-ui-components-react';
import Icon from '/imports/ui/components/common/icon/component';
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
        <BBButton
          label={intl.formatMessage(intlMessages.confirmButtonLabel)}
          dataTest="confirmUnmute"
          iconStart={<Icon iconName="unmute" />}
          onClick={handleConfirm}
          variant="primary"
          color="default"
        />
        <BBButton
          label={intl.formatMessage(intlMessages.denyButtonLabel)}
          dataTest="denyUnmute"
          iconStart={<Icon iconName="mute" />}
          onClick={handleDeny}
          variant="secondary"
          color="danger"
        />
      </Styled.RequestModalContent>
    </Styled.RequestModal>
  );
};

RequestUnmuteComponent.propTypes = propTypes;

export default RequestUnmuteComponent;
