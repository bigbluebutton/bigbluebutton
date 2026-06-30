import styled from 'styled-components';
import { colorWhite, colorGrayLighter } from '/imports/ui/stylesheets/styled-components/palette';
import { mediumUp } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { actionsBarHeight, navbarHeight, mdPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import Button from '/imports/ui/components/common/button/component';
import { CAMERADOCK_POSITION } from '../../layout/enums';

// @ts-expect-error -> Untyped component.
const NextPageButton = styled(Button)`
  color: ${colorWhite};
  width: ${mdPaddingX};

  & > i {
    [dir="rtl"] & {
      -webkit-transform: scale(-1, 1);
      -moz-transform: scale(-1, 1);
      -ms-transform: scale(-1, 1);
      -o-transform: scale(-1, 1);
      transform: scale(-1, 1);
    }
  }

  margin-left: 1px;

  @media ${mediumUp} {
    margin-left: 2px;
  }

  ${({ position }) => (position === 'contentRight' || position === 'contentLeft') && `
    order: 3;
    margin-right: 2px;
  `}
`;

// @ts-expect-error -> Untyped component.
const PreviousPageButton = styled(Button)`
  color: ${colorWhite};
  width: ${mdPaddingX};

  i {
    [dir="rtl"] & {
      -webkit-transform: scale(-1, 1);
      -moz-transform: scale(-1, 1);
      -ms-transform: scale(-1, 1);
      -o-transform: scale(-1, 1);
      transform: scale(-1, 1);
    }
  }

  margin-right: 1px;

  @media ${mediumUp} {
    margin-right: 2px;
  }

  ${({ position }) => (position === 'contentRight' || position === 'contentLeft') && `
    order: 2;
    margin-left: 2px;
  `}
`;

const VideoListItem = styled.div<{
  $focused: boolean;
}>`
  display: flex;
  overflow: hidden;
  width: 100%;
  max-height: 100%;

  ${({ $focused }) => $focused && `
    grid-column: 1 / span 2;
    grid-row: 1 / span 2;
  `}
`;

const VideoCanvas = styled.div<{
  $position: string;
}>`
  ${({ $position }) => ($position !== CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM && 'position: absolute')};
  width: 100%;
  min-height: calc((100vh - calc(${navbarHeight} + ${actionsBarHeight})) * 0.2);
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $position }) => ($position === 'contentRight' || $position === 'contentLeft') && `
    flex-wrap: wrap;
    align-content: center;
    order: 0;
  `}
`;

const VideoList = styled.div`
  display: grid;

  grid-auto-flow: dense;
  grid-gap: 1px;

  justify-content: center;

  @media ${mediumUp} {
    grid-gap: 2px;
  }
`;

const Break = styled.div`
  order: 1;
  flex-basis: 100%;
  height: 5px;
`;

const PaginationBar = styled.div`
  position: absolute;
  left: 0;
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 2px 0.5rem 0;
  z-index: 2;
`;

const PaginationDots = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const PaginationDot = styled.button<{ $active: boolean }>`
  width: 0.5rem;
  height: 0.5rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background-color: ${({ $active }) => ($active ? colorWhite : colorGrayLighter)};
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};
  transition: opacity 0.1s, background-color 0.1s;
`;

const PaginationCounter = styled.div`
  color: ${colorWhite};
  font-size: 0.75rem;
  line-height: 1;
`;

// @ts-expect-error -> Untyped component.
const PaginationArrow = styled(Button)`
  color: ${colorWhite};
  padding: 0;
  min-width: 0;

  &&,
  &&:hover,
  &&:focus,
  &&:active,
  &&:active:focus {
    background-color: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
    color: ${colorWhite} !important;
    filter: none;
  }

  &&:focus-visible {
    outline: 2px solid ${colorWhite};
    outline-offset: 2px;
  }

  i {
    font-size: 0.5rem;
  }

  &:active {
    opacity: 0.5;
  }
`;

export default {
  NextPageButton,
  PreviousPageButton,
  VideoListItem,
  VideoCanvas,
  VideoList,
  Break,
  PaginationBar,
  PaginationDots,
  PaginationDot,
  PaginationCounter,
  PaginationArrow,
};
