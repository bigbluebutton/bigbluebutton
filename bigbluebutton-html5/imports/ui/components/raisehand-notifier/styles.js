import styled from 'styled-components';
import {
  avatarSide,
  borderSize,
  avatarInset,
  smPaddingX,
  toastIconSide,
  toastMargin,
  toastMarginMobile,
  avatarWrapperOffset,
  jumboPaddingY,
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
import {
  smallOnly,
} from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';
import ToastStyled from '/imports/ui/components/common/toast/styles';

const Avatar = styled.div`
  cursor: pointer;
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
  padding: 5px 0;

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
  padding: 5px 0;
`;

const ToastIcon = styled.div`
  margin-right: ${smPaddingX};
  [dir="rtl"] & {
    margin-right: 0;
    margin-left: ${smPaddingX};
  }
`;

const IconWrapper = styled.div`
  background-color: ${colorPrimary};
  width: ${toastIconSide};
  height: ${toastIconSide};
  border-radius: 50%;
  
  & > i {
    position: relative;
    color: ${colorWhite};
    top: ${toastMargin};
    left: ${toastMargin};
    font-size: ${fontSizeXL};
  
    [dir="rtl"] & {
      left: 0;
      right: 10px;
    }
    @media ${smallOnly} {
      {
        top: ${toastMarginMobile};
        left: ${toastMarginMobile};

        [dir="rtl"] & {
          left: 0;
          right: ${toastMargin};
        }
      }
    }
  }
`;

const AvatarsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  position: absolute;
  top: ${avatarWrapperOffset};
  right: 1rem;
  left: auto;
  
  [dir="rtl"] & {
    left: ${jumboPaddingY};
    right: auto;
  }
`;

const ToastMessage = styled.div`
  font-size: ${fontSizeSmall};
  margin-top: ${toastMargin};

  & > div {
    font-weight: bold;
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

const ToastSeparator = styled(ToastStyled.Separator)``;

export default {
  Avatar,
  AvatarsExtra,
  ToastIcon,
  IconWrapper,
  AvatarsWrapper,
  ToastMessage,
  ClearButton,
  ToastSeparator,
};
