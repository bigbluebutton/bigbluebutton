import styled from 'styled-components';

import {
  userIndicatorsOffset,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  userListBg,
  colorSuccess,
} from '/imports/ui/stylesheets/styled-components/palette';

type CaptionsProps = {
  hasContent: boolean;
};

interface UserAvatarProps {
  color: string;
  moderator: boolean;
  avatar: string;
  emoji?: string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const CaptionWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 0.05rem;  
`;

const Captions = styled.div<CaptionsProps>`
  white-space: pre-line;
  word-wrap: break-word;
  font-family: Verdana, Arial, Helvetica, sans-serif;
  font-size: 1.5rem;
  background: #000000a0;
  color: white;
  ${({ hasContent }) => hasContent && `
    padding: 0.5rem;
  `}
`;

const VisuallyHidden = styled.div`
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  height: 1px;
  width: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
`;

const UserAvatarWrapper = styled.div`
  background: #000000a0;
  min-height: 3.25;
  padding: 0.5rem;
  text-transform: capitalize;
  width: 3.25rem;
`;

const UserAvatar = styled.div<UserAvatarProps>`
  flex: 0 0 2.25rem;
  margin: 0px calc(0.5rem) 0px 0px;
  box-flex: 0;
  position: relative;
  height: 2.25rem;
  width: 2.25rem;
  border-radius: 50%;
  text-align: center;
  font-size: .85rem;
  border: 2px solid transparent;
  user-select: none;
  ${
  ({ color }: UserAvatarProps) => `
    background-color: ${color};
  `}
  }
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
  ${({ moderator }: UserAvatarProps) => moderator && `
    border-radius: 5px;
  `}
  // ================ image ================
  ${({ avatar, emoji }: UserAvatarProps) => avatar?.length !== 0 && !emoji && `
    background-image: url(${avatar});
    background-repeat: no-repeat;
    background-size: contain;
  `}
  // ================ image ================
  // ================ content ================
  color: ${colorWhite} !important;
  font-size: 110%;
  text-transform: capitalize;
  display: flex;
  justify-content: center;
  align-items:center;  
  // ================ content ================
  & .react-loading-skeleton {    
    height: 2.25rem;
    width: 2.25rem;
  }
`;

export default {
  Wrapper,
  Captions,
  VisuallyHidden,
  UserAvatarWrapper,
  UserAvatar,
  CaptionWrapper,
};
