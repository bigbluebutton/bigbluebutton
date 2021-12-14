import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  presentationPlacholderText: {
    id: 'app.presentation.placeholder',
    description: 'Presentation placeholder text',
  },
});

const PresentationPlaceholder = ({
  fullscreenContext,
  intl,
  setPresentationRef,
  top,
  left,
  right,
  height,
  width,
  zIndex,
}) => (
  <Styled.Placeholder
    ref={(ref) => setPresentationRef(ref)}
    data-test="presentationPlaceholder"
    style={{
      top,
      left,
      right,
      width,
      height,
      zIndex: fullscreenContext ? zIndex : undefined,
      display: width ? 'flex' : 'none',
    }}
  >
    <span>
      { intl.formatMessage(intlMessages.presentationPlacholderText) }
    </span>
  </Styled.Placeholder>
);

export default injectIntl(PresentationPlaceholder);
