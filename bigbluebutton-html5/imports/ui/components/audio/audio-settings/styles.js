import styled, { css, keyframes } from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import {
  mdPaddingX,
  mdPaddingY,
  jumboPaddingX,
  jumboPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeSmall,
} from '/imports/ui/stylesheets/styled-components/typography';

const FormWrapper = styled.div`
  min-width: 100%;
`;

const Form = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  margin: ${mdPaddingY} ${mdPaddingX} 0 ${mdPaddingX};
  column-gap: ${jumboPaddingX};
  row-gap: ${mdPaddingY};
  @media ${smallOnly} {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
`;

const AudioNote = styled.div`
  display: block;
  margin: 0 ${mdPaddingX} ${jumboPaddingY} ${mdPaddingX};
  text-align: center;
  @media ${smallOnly} {
    font-size: ${fontSizeSmall};
  }
`;

const FormElement = styled.div`
  position: relative;
  display: flex;
  flex-flow: column;
  flex-grow: 1;
`;

const LabelSmall = styled.label`
  color: black;
  font-size: ${fontSizeSmall};
  font-weight: 600;

  & > :first-child {
    margin: 0.5rem 0 0 0 !important;
  }
`;

const LabelSmallFullWidth = styled(LabelSmall)`
  width: 100%;
`;

const ellipsis = keyframes`
  to {
    width: 1.5em;
  }
`;

const FetchingAnimation = styled.span`
  margin: auto;
  display: inline-block;
  width: 1.5em;

  &:after {
    overflow: hidden;
    display: inline-block;
    vertical-align: bottom;
    content: "\\2026"; /* ascii code for the ellipsis character */
    width: 0;
    margin-left: 0.25em;

    ${({ animations }) => animations && css`
      animation: ${ellipsis} steps(4, end) 900ms infinite;
    `}
  }
`;

export default {
  FormWrapper,
  Form,
  AudioNote,
  FormElement,
  LabelSmall,
  LabelSmallFullWidth,
  FetchingAnimation,
};
