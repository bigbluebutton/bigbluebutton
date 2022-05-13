import React from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';

const UserStatus = (props) => {
  const { voiceUser } = props;

  const listenOnly = voiceUser?.listenOnly;
  const muted = voiceUser?.muted;
  const voiceUserJoined = voiceUser?.joined;

  return (
    <>
      {(muted && !listenOnly) && <Styled.Muted iconName="unmute_filled" />}
      {listenOnly && <Styled.Voice iconName="listen" /> }
      {(voiceUserJoined && !muted) && <Styled.Voice iconName="unmute" />}
    </>
  );
};

export default UserStatus;

UserStatus.propTypes = {
  voiceUser: PropTypes.shape({
    listenOnly: PropTypes.bool.isRequired,
    muted: PropTypes.bool.isRequired,
    joined: PropTypes.bool.isRequired,
  }).isRequired,
};
