import React from 'react';
import PropTypes from 'prop-types';
import Icon from '/imports/ui/components/icon/component';
import { styles } from './styles';

const propTypes = {
  icon: PropTypes.string.isRequired,
};

const defaultProps = {
};

const ChatIcon = props => (
  <div className={styles.chatThumbnail}>
    <Icon iconName={props.icon} />
  </div>
);

ChatIcon.propTypes = propTypes;
ChatIcon.defaultProps = defaultProps;

export default ChatIcon;
