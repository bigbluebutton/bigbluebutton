import styled from 'styled-components';
import { colorDanger, colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';
import { borderSize } from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeSmaller, fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';

const SingleTyper = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
  font-size: ${fontSizeSmaller};
  max-width: 70%;
`;

const CoupleTyper = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
  font-size: ${fontSizeSmaller};
  max-width: 25%;
`;

const TypingIndicator = styled.span`
  display: flex;
  flex-direction: row;

  > span {
    display: block;
    margin-right: 0.05rem;
    margin-left: 0.05rem;
  }

  text-align: left;
  [dir="rtl"] & {
    text-align: right;
  }
`;

const TypingIndicatorWrapper = styled.div`
  ${({ error }) => error && `
    color: ${colorDanger};
    font-size: calc(${fontSizeBase} * .75);
    color: ${colorGrayDark};
    text-align: left;
    padding: ${borderSize} 0;
    position: relative;
    height: .93rem;
    max-height: .93rem;
  `}

  ${({ info }) => info && `
    font-size: calc(${fontSizeBase} * .75);
    color: ${colorGrayDark};
    text-align: left;
    padding: ${borderSize} 0;
    position: relative;
    height: .93rem;
    max-height: .93rem;
  `}

  ${({ spacer }) => spacer && `
    height: .93rem;
    max-height: .93rem;
  `}
`;

export default {
  SingleTyper,
  CoupleTyper,
  TypingIndicator,
  TypingIndicatorWrapper,
};
