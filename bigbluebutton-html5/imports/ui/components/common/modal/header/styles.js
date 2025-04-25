import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { TitleElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import {
  colorGrayDark,
  colorGrayLighter,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  mdPaddingX,
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeBase,
  headingsFontWeight,
  lineHeightComputed,
} from '/imports/ui/stylesheets/styled-components/typography';

const Header = styled.header`
  margin: 0;
  padding: 1rem;
  border: none;
  justify-content: space-between;
  display: flex;

  ${({ $headerOnTop }) => $headerOnTop && `
    grid-template-columns: auto min-content;
    grid-template-rows: min-content;
  `}

  ${({ $innerHeader }) => $innerHeader && `
    grid-template-columns: auto;
    grid-template-rows: min-content min-content;
  `}

  ${({ $hideBorder }) => !$hideBorder && `
    padding: calc(${lineHeightComputed} / 2) 0;
    border-bottom: ${borderSize} solid ${colorGrayLighter};
  `}
`;

const Title = styled(TitleElipsis)`
  display: flex;
  align-items: center;
  font-size: ${fontSizeBase};
  color: ${colorGrayDark};
  white-space: normal;
  margin: 0;
  font-weight: ${headingsFontWeight};
  text-transform: uppercase;
  line-height: calc(${lineHeightComputed} * 2);

  @media ${smallOnly} {
    font-size: ${fontSizeBase};
    padding: 0 ${mdPaddingX};
  }

  ${({ $headerOnTop }) => $headerOnTop && `
    grid-area: 1 / 1 / 2 / 3;
  `}

  ${({ $innerHeader }) => $innerHeader && `
    grid-area: 2 / 1 / 3 / 2;
  `}

  ${({ $hasMarginBottom }) => $hasMarginBottom && `
    margin-bottom: ${mdPaddingX};
  `}
`;

const DismissButton = styled(Button)`
  & > span:first-child {
    border-color: transparent;
    background-color: transparent;

    & > i { color: ${colorText}; }
  }

  ${({ $headerOnTop }) => $headerOnTop && `
    grid-area: 1 / 2 / 2 / 3;
  `}

  ${({ $innerHeader }) => $innerHeader && `
    grid-area: 1 / 1 / 2 / 2;
  `}

  justify-self: end;
`;

export default {
  Header,
  Title,
  DismissButton,
};
