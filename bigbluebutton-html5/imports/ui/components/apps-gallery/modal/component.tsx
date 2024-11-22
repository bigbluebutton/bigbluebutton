import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { TooManypinnedAppsProps } from './types';
import Styled from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.appsGallery.modal.title',
    description: 'Title for the apps warning modal',
  },
  subTitle: {
    id: 'app.appsGallery.modal.subtitle',
    description: 'Sub title for the apps warning modal',
  },
  description: {
    id: 'app.appsGallery.modal.description',
    description: 'Description for the apps warning modal',
  },
  buttonLabel: {
    id: 'app.appsGallery.modal.confirmButtonLabel',
    description: 'Label for the confirmation button',
  },
});

const TooManypinnedAppsModal = ({ setError, pinnedAppsNumber }: TooManypinnedAppsProps) => {
  const intl = useIntl();
  return (
    <Styled.Modal
      hideBorder
      priority="medium"
      shouldShowCloseButton
      isOpen
      onRequestClose={() => setError(false)}
      headerPosition="top"
      title={<Styled.Title>{intl.formatMessage(intlMessages.title)}</Styled.Title>}
      data-test="pinnedAppsWarningModal"
    >
      <Styled.ModalContent>
        <div>
          <Styled.SubTitle>{intl.formatMessage(intlMessages.subTitle, { 0: pinnedAppsNumber })}</Styled.SubTitle>
          <Styled.Description>{intl.formatMessage(intlMessages.description)}</Styled.Description>
        </div>
        <Styled.ButtonWrapper>
          <Styled.ConfirmButton
            label={intl.formatMessage(intlMessages.buttonLabel)}
            onClick={() => setError(false)}
            color="primary"
          />
        </Styled.ButtonWrapper>
      </Styled.ModalContent>
    </Styled.Modal>
  );
};

export default TooManypinnedAppsModal;
