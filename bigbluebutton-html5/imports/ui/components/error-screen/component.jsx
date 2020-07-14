import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import AudioManager from '/imports/ui/services/audio-manager';
import logger from '/imports/startup/client/logger';
import { Session } from 'meteor/session';
import { styles } from './styles';

const intlMessages = defineMessages({
  500: {
    id: 'app.error.500',
    defaultMessage: 'Oops, something went wrong',
  },
  410: {
    id: 'app.error.410',
  },
  404: {
    id: 'app.error.404',
    defaultMessage: 'Not found',
  },
  403: {
    id: 'app.error.403',
  },
  401: {
    id: 'app.error.401',
  },
  400: {
    id: 'app.error.400',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const ErrorScreen = ({ intl }) => {
  const code = Session.get('codeError');

  AudioManager.exitAudio();
  Meteor.disconnect();
  logger.error({ logCode: 'startup_client_usercouldnotlogin_error' }, `User could not log in HTML5, hit ${code}`);

  return (
    <div className={styles.background}>
      <h1 className={styles.codeError}>
        {code}
      </h1>
      <h1 className={styles.message}>
        {intl.formatMessage(intlMessages[code])}
      </h1>
      <div className={styles.separator} />
      {
        !Session.get('errorMessageDescription') || (
          <div className={styles.sessionMessage}>
            {Session.get('errorMessageDescription')}
          </div>)
      }
    </div>
  );
};

export default injectIntl(memo(ErrorScreen));

ErrorScreen.propTypes = propTypes;
