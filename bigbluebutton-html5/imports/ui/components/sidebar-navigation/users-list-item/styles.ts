import styled from 'styled-components';
import { colorGrayIcons, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmaller, fontSizeXS, titlesFontWeight } from '/imports/ui/stylesheets/styled-components/typography';

const GuestNumberIndicatorWrapper = styled.div<{ $count: number }>`
  position: absolute;
  top: -0.4rem;
  right: -0.4rem;
  background-color: ${colorGrayIcons};
  width: ${({ $count }) => ($count >= 100 ? '1.4rem' : '1.35rem')};
  height: ${({ $count }) => ($count >= 100 ? '1.4rem' : '1.35rem')};
  font-size: ${({ $count }) => ($count >= 100 ? `${fontSizeXS}` : `${fontSizeSmaller}`)};
  border-radius: 50%;
`;

const GuestNumberIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${colorWhite};
  font-style: normal;
  font-weight: ${titlesFontWeight};
  line-height: normal;
  text-align: center;
`;

export default {
  GuestNumberIndicatorWrapper,
  GuestNumberIndicator,
};
