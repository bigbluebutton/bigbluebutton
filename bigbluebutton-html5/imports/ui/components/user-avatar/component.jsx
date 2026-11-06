import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import Styled from './styles';
import browserInfo from '/imports/utils/browserInfo';

const propTypes = {
  children: PropTypes.node,
  moderator: PropTypes.bool,
  presenter: PropTypes.bool,
  you: PropTypes.bool,
  talking: PropTypes.bool,
  muted: PropTypes.bool,
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
  color = '#000',
  emoji = false,
  avatar = '',
  isSkeleton = false,
}) => {
  const { animations } = useSettings(SETTINGS.APPLICATION);
  const { useUserColorForAvatars } = window.meetingClientSettings.public.app;

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
          $userColor={useUserColorForAvatars ? color : null}
        >

          <Styled.Talking talking={talking && !muted} animations={animations} />

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
