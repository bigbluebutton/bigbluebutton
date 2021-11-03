import React from 'react';
import PropTypes from 'prop-types';
import Icon from '/imports/ui/components/icon/component';
import Styled from './styles';

const propTypes = {
  icon: PropTypes.string.isRequired,
};

const ChatIcon = props => (
  <Styled.ChatThumbnail>
    <Icon iconName={props.icon} />
  </Styled.ChatThumbnail>
);

ChatIcon.propTypes = propTypes;

export default ChatIcon;
