import styled from 'styled-components';
import { colorWhite, colorGrayLight } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmaller, titlesFontWeight } from '/imports/ui/stylesheets/styled-components/typography';

const GuestNumberIndicatorWrapper = styled.div<{ $count: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${fontSizeSmaller};
  line-height: 1;
  margin-top: -0.25rem;
`;

const GuestNumberIndicator = styled.span`
  display: block;
  color: ${colorGrayLight};
  font-style: normal;
  font-weight: ${titlesFontWeight};
  line-height: normal;
  text-align: center;

  [aria-expanded='true'] &,
  [data-active='true'] & {
    color: ${colorWhite};
  }
`;

export default {
  GuestNumberIndicatorWrapper,
  GuestNumberIndicator,
};
