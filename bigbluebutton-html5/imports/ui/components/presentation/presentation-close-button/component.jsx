import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  closePresentationLabel: {
    id: 'app.presentation.hide',
    description: 'Hide presentation label',
  },
});

const ClosePresentationComponent = ({
  intl, setPresentationIsOpen, presentationIsOpen, layoutContextDispatch, isIphone,
}) => (
  <Styled.CloseButton
    isIphone={isIphone}
    color="muted"
    icon="minus"
    size="sm"
    data-test="hidePresentationButton"
    onClick={() => { setPresentationIsOpen(layoutContextDispatch, !presentationIsOpen) } }
    label={intl.formatMessage(intlMessages.closePresentationLabel)}
    aria-label={intl.formatMessage(intlMessages.closePresentationLabel)}
    hideLabel
  />
);

export default injectIntl(ClosePresentationComponent);
