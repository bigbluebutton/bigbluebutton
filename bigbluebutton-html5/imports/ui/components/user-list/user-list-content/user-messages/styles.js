import styled from 'styled-components';

import Styled from '/imports/ui/components/user-list/styles';
import StyledContent from '/imports/ui/components/user-list/user-list-content/styles';
import { borderSize, lgPaddingY } from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import Button from '/imports/ui/components/common/button/component';

const Messages = styled(Styled.Messages)``;

const Container = styled(StyledContent.Container)``;

const Separator = styled(StyledContent.Separator)``;

const MessagesTitle = styled(Styled.SmallTitle)`
  flex: 1;
  margin: 0;
`;

const ScrollableList = styled(StyledContent.ScrollableList)``;

const List = styled(StyledContent.List)``;

const ListTransition = styled.div`
  display: flex;
  flex-flow: column;
  margin: 0;
  padding: 0;
  padding-top: ${borderSize};
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

const MinimizeButton = styled(Button)`
  border-radius: 50%;
  display: block;
  padding: 0;
  margin: 0 0.25rem;

  span {
    padding: inherit;
  }

  i {
    font-size: ${fontSizeBase} !important;
  }

  [dir="rtl"]  & {
    transform: scale(-1, 1);
  }
`;

const ListItem = styled(StyledContent.ListItem)`
  i {
    margin-left:0.7rem;
  }

  [dir="rtl"]  & {
    transform: scale(-1, 1);
  }
`;

export default {
  Messages,
  Container,
  Separator,
  MessagesTitle,
  ScrollableList,
  List,
  ListTransition,
  MinimizeButton,
  ListItem,
};
