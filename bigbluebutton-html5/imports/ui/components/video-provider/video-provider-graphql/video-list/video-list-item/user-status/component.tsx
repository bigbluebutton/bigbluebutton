// @ts-nocheck
/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';

const UserStatus = (props) => {
  const { voiceUser, user } = props;

  const listenOnly = voiceUser?.listenOnly;
  const muted = voiceUser?.muted;
  const voiceUserJoined = voiceUser?.joined;
  const emoji = user?.reaction?.reactionEmoji;
  const raiseHand = user?.raiseHand;
  const away = user?.away;
  return (
    <div>
      {away && !raiseHand && '⏰'}
      {raiseHand && '✋'}
      {(emoji && emoji !== 'none' && !raiseHand && !away) && emoji}
      {(muted && !listenOnly) && <Styled.Muted iconName="unmute_filled" />}
      {listenOnly && <Styled.Voice iconName="listen" /> }
      {(voiceUserJoined && !muted) && <Styled.Voice iconName="unmute" />}
    </div>
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
