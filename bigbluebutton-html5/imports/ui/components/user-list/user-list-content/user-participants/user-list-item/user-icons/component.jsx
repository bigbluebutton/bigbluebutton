import React, { memo } from 'react';
import PropTypes from 'prop-types';
import SlowConnection from '/imports/ui/components/slow-connection/component';
import Auth from '/imports/ui/services/auth';
import { styles } from './styles';

const METEOR_SETTINGS_APP = Meteor.settings.public.app;

const SLOW_CONNECTIONS_TYPES = METEOR_SETTINGS_APP.effectiveConnection;
const ENABLE_NETWORK_MONITORING = Meteor.settings.public.networkMonitoring.enableNetworkMonitoring;

const propTypes = {
  isModerator: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    isPresenter: PropTypes.bool.isRequired,
    isVoiceUser: PropTypes.bool.isRequired,
    issModerator: PropTypes.bool.isRequired,
    image: PropTypes.string,
  }).isRequired,
};

const UserIcons = (props) => {
  const {
    isModerator,
    user: {
      effectiveConnectionType,
      id,
    },
  } = props;

  const showNetworkInformation = ENABLE_NETWORK_MONITORING
    && SLOW_CONNECTIONS_TYPES.includes(effectiveConnectionType)
    && (id === Auth.userID || isModerator);

  return (
    <div className={styles.userIcons}>
      {
        showNetworkInformation ? (
          <span className={styles.userIconsContainer}>
            <SlowConnection effectiveConnectionType={effectiveConnectionType} iconOnly />
          </span>
        ) : null
      }
    </div>
  );
};

UserIcons.propTypes = propTypes;
export default memo(UserIcons);
