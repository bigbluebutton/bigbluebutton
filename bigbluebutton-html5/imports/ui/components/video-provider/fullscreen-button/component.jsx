import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import cx from 'classnames';
import { styles } from './styles';

const intlMessages = defineMessages({
  fullscreenButton: {
    id: 'app.fullscreenButton.label',
    description: 'Fullscreen label',
  },
});

const FullscreenButtonComponent = ({
  intl, handleFullscreen, dark, elementName = false,
}) => {
  const formattedLabel = intl.formatMessage(
    intlMessages.fullscreenButton,
    ({ 0: elementName ? elementName.toLowerCase() : '' }),
  );

  return (
    <div className={cx(styles.wrapper, dark ? styles.dark : null)}>
      <Button
        color="default"
        icon="fullscreen"
        size="sm"
        onClick={handleFullscreen}
        label={formattedLabel}
        hideLabel
        circle
        className={styles.button}
      />
    </div>
  );
};

export default injectIntl(FullscreenButtonComponent);
