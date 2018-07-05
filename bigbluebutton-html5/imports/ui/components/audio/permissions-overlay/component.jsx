import React from 'react';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { styles } from './styles';

const propTypes = {
  intl: intlShape.isRequired,
};

const intlMessages = defineMessages({
  title: {
    id: 'app.audio.permissionsOverlay.title',
    description: 'Title for the overlay',
  },
  hint: {
    id: 'app.audio.permissionsOverlay.hint',
    description: 'Hint for the overlay',
  },
});

const PermissionsOverlay = ({ intl }) => (
  <div className={styles.overlay}>
    <div className={styles.hint}>
      { intl.formatMessage(intlMessages.title) }
      <small>
        { intl.formatMessage(intlMessages.hint) }
      </small>
    </div>
  </div>
);

PermissionsOverlay.propTypes = propTypes;

export default injectIntl(PermissionsOverlay);
