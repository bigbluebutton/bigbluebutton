import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { styles } from '../styles';

const intlMessages = defineMessages({
  closePresentationLabel: {
    id: 'app.presentation.close',
    description: 'Close presentation label',
  },
});

const ClosePresentationComponent = ({
  intl,
  innerStyle,
  toggleSwapLayout,
}) => (
  <div style={innerStyle} className={styles.topRight}>
    <Button
      role="button"
      aria-labelledby="closeLabel"
      aria-describedby="closeDesc"
      color="default"
      icon="close"
      size="sm"
      onClick={toggleSwapLayout}
      label={intl.formatMessage(intlMessages.closePresentationLabel)}
      hideLabel
      className={styles.close}
    />
  </div>
);

export default injectIntl(ClosePresentationComponent);
