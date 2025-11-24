import styled from 'styled-components';
import { colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';
import { smPaddingY } from '/imports/ui/stylesheets/styled-components/general';
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
  font-size: calc(${fontSizeBase} * .75);
  color: ${colorGrayDark};
  text-align: left;
  vertical-align: top;
  padding: ${smPaddingY} ${smPaddingY} 0;
  height: 1.5rem;
  max-height: 1.5rem;
  line-height: 1;
  overflow-y: hidden;
`;

export default {
  SingleTyper,
  CoupleTyper,
  TypingIndicator,
  TypingIndicatorWrapper,
};
