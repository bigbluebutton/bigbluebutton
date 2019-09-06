import React, { memo } from 'react';
import PropTypes from 'prop-types';
import SlowConnection from '/imports/ui/components/slow-connection/component';
import Auth from '/imports/ui/services/auth';
import { styles } from './styles';

const METEOR_SETTINGS_APP = Meteor.settings.public.app;

const SLOW_CONNECTIONS_TYPES = METEOR_SETTINGS_APP.effectiveConnection;
const ENABLE_NETWORK_MONITORING = Meteor.settings.public.networkMonitoring.enableNetworkMonitoring;

const propTypes = {
  amIModerator: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    // effectiveConnectionType: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
  }).isRequired,
};

const UserIcons = (props) => {
  const {
    amIModerator,
    user: {
      effectiveConnectionType,
      userId,
    },
  } = props;

  const showNetworkInformation = ENABLE_NETWORK_MONITORING
    && SLOW_CONNECTIONS_TYPES.includes(effectiveConnectionType)
    && (userId === Auth.userID || amIModerator);

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
