import styled from 'styled-components';
import { fontSizeBase, fontSizeLarge, lineHeightComputed } from '/imports/ui/stylesheets/styled-components/typography';
import { colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';

import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const List = styled.ul`
  list-style: none;
  font-size: ${fontSizeBase};
  margin: 0;
  padding: 0;
  text-align: left;
  color: ${colorGrayDark};
  display: flex;
  overflow-wrap: break-word;
  white-space: pre-line;

  [dir="rtl"] & {
    text-align: right;
  }

  @media ${smallOnly} {
    font-size: calc(${fontSizeLarge} * 1.1);
    padding: ${lineHeightComputed};
  }

  ${({ direction }) => direction === 'horizontal' && `
    padding: 0;
    flex-direction: row;

    @media ${smallOnly} {
      flex-direction: column;
      padding: calc(${lineHeightComputed} / 1.5) 0;
    }

    padding: 0 calc(${lineHeightComputed} / 3);
  `}

  ${({ direction }) => direction === 'vertical' && `
    flex-direction: column;
    width: 100%;
  `}
`;

export default {
  List,
};
