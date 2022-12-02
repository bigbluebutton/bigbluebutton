import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  closeRemoteDesktopLabel: {
    id: 'app.remoteDesktop.hide',
    description: 'Hide remote desktop label',
  },
});

const CloseDesktopComponent = ({ intl, toggleSwapLayout }) => (
  <Button
    role="button"
    aria-labelledby="closeLabel"
    aria-describedby="closeDesc"
    icon="minus"
    size="sm"
    onClick={toggleSwapLayout}
    label={intl.formatMessage(intlMessages.closeRemoteDesktopLabel)}
    hideLabel
    className={styles.button}
  />
);

export default injectIntl(CloseDesktopComponent);
