import styled, { css, keyframes } from 'styled-components';
import Icon from '/imports/ui/components/common/icon/component';
import { headingsFontWeight } from '/imports/ui/stylesheets/styled-components/typography';
import {
  colorDanger,
  colorGray,
  colorSuccess,
  colorGrayLightest,
  colorOffWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderSizeLarge,
  lgPaddingX,
  statusIconSize,
  borderSize,
  statusInfoHeight,
} from '/imports/ui/stylesheets/styled-components/general';

const DropdownButton = styled.button`
  background-color: ${colorOffWhite};
  border: none;
  border-radius: 13px;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.16),
    0px 2px 3px rgba(0, 0, 0, 0.24),
    0px 2px 6px rgba(0, 0, 0, 0.1);
  color: #2d2d2d;
  cursor: pointer;
  padding: .3rem .5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  tab-index: 0;

  &:hover {
    background-color: ${colorGrayLightest};
  }
`;

const Right = styled.div`
  cursor: pointer;
  position: absolute;
  right: 2px;
  top: 2px;
  z-index: 999;
  > div {
    width: 50px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  button {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  [dir="rtl"] &{
      left: 2px;
      right: auto;
    }
`;
const ToastText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  white-space: nowrap;
  position: relative;
  top: ${borderSizeLarge};
  width: auto;
  font-weight: ${headingsFontWeight};

  [dir="rtl"] & {
    text-align: right;
  }
`;

const StatusIcon = styled.span`
  margin-left: auto;

  [dir="rtl"] & {
    margin-right: auto;
    margin-left: 0;
  }

  & > i {
    position: relative;
    top: 1px;
    height: ${statusIconSize};
    width: ${statusIconSize};
  }
`;

const rotate = keyframes`
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
`;

const ToastIcon = styled(Icon)`
  position: relative;
  width: ${statusIconSize};
  height: ${statusIconSize};
  font-size: 117%;
  bottom: ${borderSize};
  left: ${statusInfoHeight};

  [dir="rtl"] & {
    left: auto;
    right: ${statusInfoHeight};
  }

  ${({ done }) => done && `
    color: ${colorSuccess};
  `}

  ${({ error }) => error && `
    color: ${colorDanger};
  `}

  ${({ loading }) => loading && css`
    color: ${colorGrayLightest};
    border: 1px solid;
    border-radius: 50%;
    border-right-color: ${colorGray};
    animation: ${rotate} 1s linear infinite;
  `}
`;

const Line = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: nowrap;
  padding: ${lgPaddingX} 0;
`;

const ButtonIcon = styled(Icon)`
  width: 1em;
  text-align: center;
`;

export default {
  DropdownButton,
  Right,
  ToastText,
  StatusIcon,
  ToastIcon,
  Line,
  ButtonIcon,
};
