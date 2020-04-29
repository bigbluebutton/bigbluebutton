import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { styles } from './styles';

const propTypes = {
  children: PropTypes.node.isRequired,
};

const ChannelAvatar = ({
  children,
}) => (

  <div
    aria-hidden="true"
    data-test="userAvatar"
    className={cx(styles.avatar)}
  >
    <div className={styles.content}>
      {children}
    </div>
  </div>
);

ChannelAvatar.propTypes = propTypes;

export default ChannelAvatar;
