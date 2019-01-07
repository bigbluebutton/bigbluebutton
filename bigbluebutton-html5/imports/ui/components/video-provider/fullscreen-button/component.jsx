import React from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { styles } from '../styles';

const intlMessages = defineMessages({
  fullscreenButton: {
    id: 'app.fullscreenButton.label',
    description: 'Fullscreen label',
  },
});

const FullscreenButtonComponent = ({
  intl,
  handleFullscreen,
  innerStyle,
}) => {

  return (
    <div style={innerStyle} className={styles.fullscreenButton}>
      <Button
       role="button"
       aria-labelledby="fullscreenButtonLabel"
       aria-describedby="fullscreenButtonDesc"
       color="default"
       icon="fullscreen"
       size="sm"
       onClick={handleFullscreen}
       label={intl.formatMessage(intlMessages.fullscreenButton)}
       hideLabel
       circle
       className={styles.button}
     />
    </div>
  );
};

export default injectIntl(FullscreenButtonComponent);
