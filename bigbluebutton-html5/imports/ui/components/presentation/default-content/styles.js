import styled from 'styled-components';
import { CSSTransition } from 'react-transition-group';
import { largeUp } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { lineHeightComputed } from '/imports/ui/stylesheets/styled-components/typography';

const Transition = styled(CSSTransition)`
  flex-basis: 90%;

  @media ${largeUp} {
    flex-basis: 90%;
  }
`;

const Content = styled.div`
  height: 100%;
  width: 100%;

  &.transition-appear {
    opacity: 0.01;
  }

  &.transition-appear-active {
    opacity: 1;

    ${({ animations }) => animations && `
      transition: opacity 700ms ease-in;
    `}
  }
`;

const DefaultContent = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  padding: ${lineHeightComputed};
  border: 0.25rem dashed;
  border-radius: 1.5rem;
  color: rgba(255, 255, 255, .5);
  text-align: center;
  overflow: auto;

  ${({ hideContent }) => hideContent && `
    visibility: hidden;
  `}
`;

export default {
  Transition,
  Content,
  DefaultContent,
};
