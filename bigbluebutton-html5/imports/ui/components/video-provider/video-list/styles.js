import styled from 'styled-components';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { mdPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import { mediumUp } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { actionsBarHeight, navbarHeight } from '/imports/ui/stylesheets/styled-components/general';
import Button from '/imports/ui/components/common/button/component';

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

const VideoListItem = styled.div`
  display: flex;
  overflow: hidden;
  width: 100%;
  max-height: 100%;

  ${({ focused }) => focused && `
    grid-column: 1 / span 2;
    grid-row: 1 / span 2;
  `}
`;

const VideoCanvas = styled.div`
  position: absolute;
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

  ${({ position }) => (position === 'contentRight' || position === 'contentLeft') && `
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

export default {
  NextPageButton,
  PreviousPageButton,
  VideoListItem,
  VideoCanvas,
  VideoList,
  Break,
};
