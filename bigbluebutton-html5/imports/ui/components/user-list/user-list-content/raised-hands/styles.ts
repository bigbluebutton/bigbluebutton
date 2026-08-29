import styled from 'styled-components';
import {
  colorGray,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  smPaddingX,
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import Button from '/imports/ui/components/common/button/component';
import StyledContent from '/imports/ui/components/user-list/user-list-content/styles';
import deviceInfo from '/imports/utils/deviceInfo';

const { isMobile } = deviceInfo;

const RaisedHandsContainer = styled.div`
  display: flex;
  flex-direction: column;
  
  ${!isMobile && `
    max-height: 30vh;
  `}
`;

const RaisedHandsTitle = styled.h2`
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0 ${smPaddingX};
  color: ${colorGray};
  margin: 0;
  width: 100%;
`;

const RaisedHandsItem = styled.div`
  align-items: center;
  margin-left: 0.45rem;
`;

// @ts-ignore - as button comes from JS, we can't provide its props
const ClearButton = styled(Button)`
  position: relative;
  color: ${colorPrimary};
  &:focus,
  &:hover,
  &:active {
    color: ${colorPrimary};
    box-shadow: none;
  }
  padding: 1.2rem 0;
  margin: ${smPaddingX};
`;

const ScrollableList = styled(StyledContent.ScrollableList)``;
const List = styled(StyledContent.List)``;
const ListTransition = styled.div`
  display: flex;
  flex-flow: column;
  padding: ${borderSize} 0 0 0;
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

const TitleContainer = styled(StyledContent.Container)``;

export default {
  RaisedHandsContainer,
  RaisedHandsTitle,
  RaisedHandsItem,
  ClearButton,
  ScrollableList,
  List,
  ListTransition,
  TitleContainer,
};
