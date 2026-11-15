import styled, { css, keyframes } from 'styled-components';
import {
  userIndicatorsOffset,
  avatarBorderRadius,
  moderatorAvatarBorderRadius,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  userListBg,
  colorSuccess,
  colorDanger,
  colorUserModerator,
  colorUserYou,
  colorUserViewer,
} from '/imports/ui/stylesheets/styled-components/palette';

const Content = styled.div`
  color: ${colorWhite};
  top: 50%;
  position: absolute;
  text-align: center;
  left: 0;
  right: 0;
  font-size: 110%;
  text-transform: capitalize;

  &,
  & > * {
    line-height: 0; // to keep centralized vertically
  }
`;

const Image = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const Img = styled.img`
  object-fit: cover;
  overflow: hidden;

  ${({ moderator }) => moderator && `
    border-radius: 3px;
  `}

  ${({ moderator }) => !moderator && `
    border-radius: 50%;
  `}
`;

const pulse = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
`;

const Talking = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: inherit;

  ${({ talking }) => talking && css`
    background-color: currentColor;
  `}

  ${({ talking, animations }) => talking && animations && css`
    animation: ${pulse} 1s infinite ease-in;
  `}

  &::before {
    ${({ talking, animations }) => talking && !animations && `
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: currentColor;
      border-radius: inherit;
      box-shadow: 0 0 0 4px currentColor;
      opacity: .5;
    `}
  }
`;

const Avatar = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${avatarBorderRadius};
  text-align: center;
  font-size: .85rem;
  border: 2px solid transparent;
  user-select: none;

  ${({ animations }) => animations && `
    transition: .3s ease-in-out;
  `}

  &:after,
  &:before {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    padding-top: .5rem;
    padding-right: 0;
    padding-left: 0;
    padding-bottom: 0;
    color: inherit;
    top: auto;
    left: auto;
    bottom: ${userIndicatorsOffset};
    right: ${userIndicatorsOffset};
    border: 1.5px solid ${userListBg};
    border-radius: 50%;
    background-color: ${colorSuccess};
    color: ${colorWhite};
    opacity: 0;
    font-family: 'bbb-icons';
    font-size: .65rem;
    line-height: 0;
    text-align: center;
    vertical-align: middle;
    letter-spacing: -.65rem;
    z-index: 1;

    [dir="rtl"] & {
      left: ${userIndicatorsOffset};
      right: auto;
      padding-right: .65rem;
      padding-left: 0;
    }

    ${({ animations }) => animations && `
      transition: .3s ease-in-out;
    `}
  }

  ${({ viewer }) => viewer && `
    background-color: ${colorUserViewer};
    color: ${colorUserViewer};
  `}
    
  ${({ moderator }) => moderator && `
    border-radius: ${moderatorAvatarBorderRadius};
    background-color: ${colorUserModerator};
    color: ${colorUserModerator};
  `}

  ${({ you }) => you && `
    background-color: ${colorUserYou};
    color: ${colorUserYou};
  `}
`;

// Badge on the bottom corner of the avatar with the audio state of the user. The colors
// follow the 3.0 user list: green in audio (microphone or listen only), red when muted,
// and an empty circle in the color of the panel behind the list when not in the audio.
const AUDIO_STATE_COLORS = {
  unmuted: colorSuccess,
  muted: colorDanger,
  listenOnly: colorSuccess,
  none: colorWhite,
};

const AudioState = styled.div`
  position: absolute;
  bottom: ${userIndicatorsOffset};
  right: ${userIndicatorsOffset};
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 1.2rem;
  height: 1.2rem;
  border: 1.5px solid ${userListBg};
  border-radius: 50%;
  background-color: ${({ state }) => AUDIO_STATE_COLORS[state]};
  color: ${colorWhite};
  font-size: .65rem;
  line-height: 1;

  ${({ state }) => state === 'none' && `
    border-color: ${colorWhite};
  `}

  [dir="rtl"] & {
    right: auto;
    left: ${userIndicatorsOffset};
  }

  ${({ animations }) => animations && `
    transition: background-color .3s ease-in-out;
  `}

  & > i {
    line-height: 1;
  }
`;

const Skeleton = styled.div`
  & .react-loading-skeleton {    
    height: 2.25rem;
    width: 2.25rem;
  }
`;

export default {
  Content,
  Image,
  Img,
  Talking,
  Avatar,
  AudioState,
  Skeleton,
};
