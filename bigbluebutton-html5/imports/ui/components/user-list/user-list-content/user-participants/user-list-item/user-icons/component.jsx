import React from 'react';
import PropTypes from 'prop-types';
import Icon from '/imports/ui/components/icon/component';
import SlowConnection from '/imports/ui/components/slow-connection/component';
import { styles } from './styles';

// https://github.com/bigbluebutton/bigbluebutton/issues/5286#issuecomment-465342716
const SLOW_CONNECTIONS_TYPES = Meteor.settings.public.app.effectiveConnection;

const propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    isPresenter: PropTypes.bool.isRequired,
    isVoiceUser: PropTypes.bool.isRequired,
    isModerator: PropTypes.bool.isRequired,
    image: PropTypes.string,
  }).isRequired,
};

const UserIcons = (props) => {
  const {
    user: {
      isSharingWebcam,
      effectiveConnectionType,
    },
  } = props;

  return (
    <div className={styles.userIcons}>
      {
        isSharingWebcam ? (
          <span className={styles.userIconsContainer}>
            <Icon iconName="video" />
          </span>
        ) : null
      }
      {
        SLOW_CONNECTIONS_TYPES.includes(effectiveConnectionType) ? (
          <span className={styles.userIconsContainer}>
            <SlowConnection iconOnly />
          </span>
        ) : null
      }
    </div>
  );
};

UserIcons.propTypes = propTypes;
export default UserIcons;
