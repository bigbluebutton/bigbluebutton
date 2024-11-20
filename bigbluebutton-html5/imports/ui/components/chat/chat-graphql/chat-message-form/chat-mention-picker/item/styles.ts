import styled, { css } from 'styled-components';
import {
  userIndicatorsOffset, mdPaddingY, indicatorPadding, smPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  userListBg, colorSuccess, colorWhite, colorPrimary,
  colorBlueLightest,
  colorGrayDark,
} from '/imports/ui/stylesheets/styled-components/palette';

const ListItem = styled.li`
  height: 50px;
`;

const Button = styled.button<{ $focused: boolean }>`
  height: 100%;
  width: 100%;
  background: none;
  border: none;
  outline: none;
  padding: ${smPaddingX};
  display: flex;
  align-items: center;

  &:hover, &:focus {
    background-color: ${colorBlueLightest};
  }

  ${({ $focused }) => $focused && css`
    background-color: ${colorBlueLightest};
  `}
`;

const Username = styled.span`
  font-size: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 400;
  color: ${colorGrayDark};
  margin: 0 0 0 ${smPaddingX};
`;

interface AvatarProps {
  moderator?: boolean;
  presenter?: boolean;
  color?: string;
  avatar?: string;
  isChrome?: boolean;
  isFirefox?: boolean;
  isEdge?: boolean;
}

const Avatar = styled.div<AvatarProps>`
  position: relative;
  height: 2.25rem;
  width: 2.25rem;
  min-width: 2.25rem;
  border-radius: 50%;
  text-align: center;
  border: 2px solid transparent;
  user-select: none;
  color: ${colorWhite} !important;
  font-size: 110%;
  text-transform: capitalize;
  display: flex;
  justify-content: center;
  align-items:center;

  ${({ color }) => css`
    background-color: ${color};
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
  }

  ${({ moderator }) => moderator && css`
    border-radius: 5px;
    color: ${colorWhite} !important;
  `}

  ${({ presenter }) => presenter && css`
    &:before {
      content: "\\00a0\\e90b\\00a0";
      padding: ${mdPaddingY} !important;
      opacity: 1;
      top: ${userIndicatorsOffset};
      left: ${userIndicatorsOffset};
      bottom: auto;
      right: auto;
      border-radius: 5px;
      background-color: ${colorPrimary};

      [dir="rtl"] & {
        left: auto;
        right: ${userIndicatorsOffset};
        letter-spacing: -.33rem;
      }
    }
  `}

  ${({
    presenter, isChrome, isFirefox, isEdge,
  }) => presenter && (isChrome || isFirefox || isEdge) && css`
    &:before {
      padding: ${indicatorPadding} !important;
    }
  `}

  ${({ avatar, color }) => avatar?.length !== 0 && css`
    background-image: url(${avatar});
    background-repeat: no-repeat;
    background-size: contain;
    border: 2px solid ${color};
  `}
`;

export default {
  ListItem,
  Button,
  Avatar,
  Username,
};
