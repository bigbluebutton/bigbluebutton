import React from 'react';
import PropTypes from 'prop-types';
import Icon from '/imports/ui/components/icon/component';
import { styles } from './styles';

const propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    isPresenter: PropTypes.bool.isRequired,
    isVoiceUser: PropTypes.bool.isRequired,
    isModerator: PropTypes.bool.isRequired,
    image: PropTypes.string,
  }).isRequired,
  compact: PropTypes.bool.isRequired,
};

const UserIcons = (props) => {
  const {
    user,
    compact,
  } = props;

  if (compact || user.isSharingWebcam) {
    return null;
  }

  return (
    <div className={styles.userIcons}>
      {
        user.isSharingWebcam ?
          <span className={styles.userIconsContainer}>
            <Icon iconName="video" />
          </span>
          : null
      }
    </div>
  );
};

UserIcons.propTypes = propTypes;
export default UserIcons;
