import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { styles } from './styles';

const propTypes = {
  children: PropTypes.node.isRequired,
  moderator: PropTypes.bool.isRequired,
  presenter: PropTypes.bool.isRequired,
  talking: PropTypes.bool.isRequired,
  muted: PropTypes.bool.isRequired,
  listenOnly: PropTypes.bool.isRequired,
  voice: PropTypes.bool.isRequired,
  color: PropTypes.string,
  className: PropTypes.string,
};

const defaultProps = {
  moderator: false,
  presenter: false,
  talking: false,
  muted: false,
  listenOnly: false,
  voice: false,
  color: '#000',
  className: null,
};

const UserAvatar = ({
  children,
  moderator,
  presenter,
  talking,
  muted,
  listenOnly,
  color,
  voice,
  className,
}) => (
  <div
    className={cx(styles.avatar, {
      [styles.moderator]: moderator,
      [styles.presenter]: presenter,
      [styles.muted]: muted,
      [styles.listenOnly]: listenOnly,
      [styles.talking]: (talking && !muted),
      [styles.voice]: voice,
    }, className)}
    style={{
      backgroundColor: color,
      color, // We need the same color on both for the border
    }}
  >
    <div className={styles.content}>
      {children}
    </div>
  </div>
);

UserAvatar.propTypes = propTypes;
UserAvatar.defaultProps = defaultProps;

export default UserAvatar;
