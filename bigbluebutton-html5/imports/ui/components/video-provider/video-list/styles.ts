import styled from 'styled-components';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { mediumUp } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { actionsBarHeight, navbarHeight, mdPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import Button from '/imports/ui/components/common/button/component';

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
  $isContent: boolean;
  $contentRowSpan: number;
}>`
  display: flex;
  overflow: hidden;
  width: 100%;
  height: 100%;
  max-height: 100%;

  ${({ $focused, $isContent }) => $focused && !$isContent && `
    grid-column: 1 / span 2;
    grid-row: 1 / span 2;
  `}

  ${({ $isContent, $contentRowSpan }) => $isContent && `
    grid-column: 1 / -1;
    grid-row: span ${Math.max($contentRowSpan, 1)};
    order: 1;
  `}
`;

const VideoCanvas = styled.div<{
  $position: string;
  $hasContent: boolean;
}>`
  position: absolute;
  width: 100%;
  min-height: calc((100vh - calc(${navbarHeight} + ${actionsBarHeight})) * 0.2);
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: ${({ $hasContent }) => ($hasContent ? 'flex-start' : 'center')};
  justify-content: center;
  align-items: center;
  flex-direction: ${({ $hasContent }) => ($hasContent ? 'column' : 'row')};

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

const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  min-height: 50%;
  align-items: stretch;
  justify-content: center;
  position: relative;
`;

const PeekOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  pointer-events: auto;
  z-index: 2;
  background: rgba(0, 0, 0, 0.35);
`;

const PeekCard = styled.div`
  position: relative;
  pointer-events: auto;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
`;

// @ts-expect-error -> Untyped component.
const PeekCloseButton = styled(Button)`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
`;

export default {
  NextPageButton,
  PreviousPageButton,
  VideoListItem,
  VideoCanvas,
  VideoList,
  Break,
  ContentWrapper,
  PeekOverlay,
  PeekCard,
  PeekCloseButton,
};
