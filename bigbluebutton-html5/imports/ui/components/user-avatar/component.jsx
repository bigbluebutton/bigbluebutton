import React from 'react';
import PropTypes from 'prop-types';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import Styled from './styles';
import browserInfo from '/imports/utils/browserInfo';

const propTypes = {
  children: React.ReactNode,
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
  children = <></>,
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
  const Settings = getSettingsSingletonInstance();
  const { animations } = Settings.application;

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
          className={className}
          isChrome={isChrome}
          isFirefox={isFirefox}
          isEdge={isEdge}
          color={color}
        >

          <Styled.Talking talking={talking && !muted} animations={animations} />

          {avatar && avatar.length !== 0 && !emoji
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
