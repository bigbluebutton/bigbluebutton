import styled from 'styled-components';
import {
  avatarSide,
  borderSize,
  avatarInset,
  smPaddingX,
  toastMargin,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  colorGrayLighter,
  colorGrayLight,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeXL,
  fontSizeSmall,
} from '/imports/ui/stylesheets/styled-components/typography';
import Button from '/imports/ui/components/common/button/component';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import ToastStyled from '/imports/ui/components/common/toast/styles';

const ButtonAvatar = styled.div`
  cursor: pointer;
  outline: transparent;
  outline-style: dotted;
  outline-width: ${borderSize};
  width: ${avatarSide};
  height: ${avatarSide};
  color: ${colorWhite};
  border: solid ${borderSize} ${colorWhite};
  margin-left: ${avatarInset};
  text-align: center;
`;

const Avatar = styled(UserAvatar)`
  padding: 0.75rem 0;
  border: solid ${borderSize} ${colorWhite};
  &:hover,
  &:focus {
    border: solid ${borderSize} ${colorGrayLighter};
  }
`;

const AvatarsExtra = styled.div`
  background-color: ${colorGrayLight};
  outline: transparent;
  outline-style: dotted;
  outline-width: ${borderSize};
  width: ${avatarSide};
  height: ${avatarSide};
  color: ${colorWhite};
  border-radius: 50%;
  border: solid ${borderSize} ${colorWhite};
  margin-left: ${avatarInset};
  text-align: center;
  padding: 0.75rem 0;
`;

const ToastContent = styled.div`
  margin-right: ${smPaddingX};
  display: flex;
  justify-content: space-between;
  // justify-content: flex-end;
  [dir="rtl"] & {
    margin-right: 0;
    margin-left: ${smPaddingX};
  }
`;

const IconWrapper = styled.div`
  background-color: ${colorPrimary};
  width: ${avatarSide};
  height: ${avatarSide};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  
  & > i {
    color: ${colorWhite};
    font-size: ${fontSizeXL};
  }
`;

const ToastMessage = styled.div`
  font-size: ${fontSizeSmall};
  margin-top: ${toastMargin};
  color: black;

  & > div {
    font-weight: bold;
    line-height: 2;
  }
`;

const ClearButton = styled(Button)`
  position: relative;
  width: 100%;
  margin-top: ${toastMargin};
  color: ${colorPrimary};

  &:focus,
  &:hover,
  &:active {
    color: ${colorPrimary};
    box-shadow: 0;
  }
`;

const AvatarWrapper = styled.div`
  display: flex;
`;

const ToastContentWrapper = styled.div`
  width: 100%;
`;

const ToastSeparator = styled(ToastStyled.Separator)``;

export default {
  ButtonAvatar,
  Avatar,
  ToastContentWrapper,
  AvatarsExtra,
  ToastContent,
  IconWrapper,
  ToastMessage,
  ClearButton,
  ToastSeparator,
  AvatarWrapper,
};
