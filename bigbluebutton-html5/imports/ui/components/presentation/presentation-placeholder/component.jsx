import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles.scss';

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
  <div
    ref={(ref) => setPresentationRef(ref)}
    className={styles.presentationPlaceholder}
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
  </div>
);

export default injectIntl(PresentationPlaceholder);
