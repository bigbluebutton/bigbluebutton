import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { TooManyPinnedWidgetsProps } from './types';
import Styled from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.widgets.modal.title',
    description: 'Title for the widgets warning modal',
  },
  subTitle: {
    id: 'app.widgets.modal.subtitle',
    description: 'Sub title for the widgets warning modal',
  },
  description: {
    id: 'app.widgets.modal.description',
    description: 'Description for the widgets warning modal',
  },
  buttonLabel: {
    id: 'app.widgets.modal.confirmButtonLabel',
    description: 'Label for the confirmation button',
  },
});

const TooManyPinnedWidgetsModal = ({ setError, pinnedWidgetsNumber }: TooManyPinnedWidgetsProps) => {
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
      data-test="pinnedWidgetsWarningModal"
    >
      <Styled.ModalContent>
        <div>
          <Styled.SubTitle>{intl.formatMessage(intlMessages.subTitle, { 0: pinnedWidgetsNumber })}</Styled.SubTitle>
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

export default TooManyPinnedWidgetsModal;
