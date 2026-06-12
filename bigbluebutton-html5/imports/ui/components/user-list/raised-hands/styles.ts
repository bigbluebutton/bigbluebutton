import styled from 'styled-components';
import {
  colorWhite,
  colorGrayDark,
  colorGrayLight,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  smPaddingX,
  borderSizeSmall,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeBase,
  textFontWeight,
} from '../../../stylesheets/styled-components/typography';
import Button from '/imports/ui/components/common/button/component';
import deviceInfo from '/imports/utils/deviceInfo';
import { Separator as BaseSeparator } from '/imports/ui/components/sidebar-content/styles';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

const { isMobile } = deviceInfo;

const RaisedHandsContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${!isMobile && `
    max-height: 30vh;
  `}
`;

const RaisedHandsTitle = styled.span`
  font-size: ${fontSizeBase};
  font-weight: ${textFontWeight};
  color: ${colorGrayDark};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RaisedHandsItem = styled.div`
  align-items: center;
  margin-left: 0.45rem;
`;

// @ts-ignore - as button comes from JS, we can't provide its props
const ClearButton = styled(Button)`
  position: relative;
  background-color: transparent !important;
  color: ${colorGrayDark} !important;
  border: ${borderSizeSmall} solid ${colorGrayLight};
  border-radius: 5px;

  margin: ${smPaddingX};
  padding: 0.75rem 1rem;

  &:focus,
  &:hover,
  &:active {
    background-color: #f5f5f5 !important;
    color: ${colorGrayDark} !important;
    box-shadow: none;
    border-color: ${colorGrayLight};
  }
`;

const ScrollableList = styled(ScrollboxVertical)``;
const List = styled.div`
  display: flex;
  flex-direction: column;
`;
const ListTransition = styled.div`
  display: flex;
  flex-flow: column;
  padding: ${borderSizeSmall} 0 0 0;
  outline: none;
  overflow: hidden;
  flex-shrink: 1;

  &.transition-enter,
  &.transition-appear {
    opacity: 0.01;
  }

  &.transition-enter-active,
  &.transition-appear-active {
    opacity: 1;

    &.animationsEnabled {
      transition: all 600ms;
    }
  }

  &.transition-leave {
    opacity: 1;
  }

  &.transition-leave-active {
    opacity: 0;

    &.animationsEnabled {
      transition: all 600ms;
    }
  }
`;

const TitleContainer = styled.div`
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LowerAllHandsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${colorPrimary};
  font-size: ${fontSizeBase};
  font-weight: ${textFontWeight};
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const IndexBadge = styled.div`
  position: absolute;
  top: -1.5rem;
  right: -0.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background-color: ${colorPrimary || '#0F70D2'};
  color: ${colorWhite};
  font-size: 0.75rem;
  font-weight: bold;
  z-index: 10;
  box-shadow: 0 0 0 2px ${colorWhite};
`;

const EmojiContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const Separator = styled(BaseSeparator)``;

export default {
  RaisedHandsContainer,
  RaisedHandsTitle,
  RaisedHandsItem,
  ClearButton,
  ScrollableList,
  List,
  ListTransition,
  TitleContainer,
  LowerAllHandsButton,
  IndexBadge,
  EmojiContainer,
  Separator,
};
