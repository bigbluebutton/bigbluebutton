import styled, { css, keyframes } from 'styled-components';
import {
  userIndicatorsOffset,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  userListBg,
  colorSuccess,
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
  border-radius: 50%;
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
    border-radius: 5px;
    background-color: ${colorUserModerator};
    color: ${colorUserModerator};
  `}

  ${({ you }) => you && `
    background-color: ${colorUserYou};
    color: ${colorUserYou};
  `}
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
  Skeleton,
};
