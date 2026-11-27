import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import Styled from './styles';
import browserInfo from '/imports/utils/browserInfo';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';

// Icon of the audio state badge. A user who is not in the audio gets an empty badge,
// and an avatar given no audio state shows no badge at all.
const AUDIO_STATE_ICONS = {
  unmuted: 'unmute',
  muted: 'mute',
  listenOnly: 'listen',
  none: null,
};

const propTypes = {
  children: PropTypes.node,
  moderator: PropTypes.bool,
  presenter: PropTypes.bool,
  you: PropTypes.bool,
  talking: PropTypes.bool,
  muted: PropTypes.bool,
  audioState: PropTypes.oneOf(Object.keys(AUDIO_STATE_ICONS)),
  color: PropTypes.string,
  emoji: PropTypes.bool,
  avatar: PropTypes.string,
  className: PropTypes.string,
  isSkeleton: PropTypes.bool,
};

const { isChrome, isFirefox, isEdge } = browserInfo;

const UserAvatar = ({
  children = null,
  moderator = false,
  presenter = false,
  you = false,
  className = '',
  talking = false,
  muted = false,
  audioState = '',
  color = '#000',
  emoji = false,
  avatar = '',
  isSkeleton = false,
}) => {
  const { animations } = useSettings(SETTINGS.APPLICATION);

  return (
    <>
      {isSkeleton && (<Styled.Skeleton>{children}</Styled.Skeleton>)}

      {!isSkeleton && (
        <Styled.Avatar
          aria-hidden="true"
          data-test={moderator ? 'moderatorAvatar' : 'viewerAvatar'}
          moderator={moderator}
          presenter={presenter}
          you={you}
          viewer={!you && !moderator}
          className={cx('bbb-avatar', {
            'bbb-avatar--moderator': moderator,
            'bbb-avatar--presenter': presenter,
            'bbb-avatar--you': you,
            'bbb-avatar--talking': talking && !muted,
          }, className)}
          isChrome={isChrome}
          isFirefox={isFirefox}
          isEdge={isEdge}
          color={color}
        >

          <Styled.Talking
            className="bbb-avatar__talking"
            talking={talking && !muted}
            animations={animations}
          />

          {audioState && (
            <Styled.AudioState
              state={audioState}
              animations={animations}
              data-test="userAudioState"
              data-audio-state={audioState}
            >
              {AUDIO_STATE_ICONS[audioState] && <Icon iconName={AUDIO_STATE_ICONS[audioState]} />}
            </Styled.AudioState>
          )}

          {avatar != null && avatar.length !== 0 && !emoji
            ? (
              <Styled.Image>
                <Styled.Img
                  moderator={moderator}
                  src={avatar}
                />
              </Styled.Image>
            ) : (
              <Styled.Content>
                {children}
              </Styled.Content>
            )}
        </Styled.Avatar>
      )}
    </>
  );
};

UserAvatar.propTypes = propTypes;

export default UserAvatar;
