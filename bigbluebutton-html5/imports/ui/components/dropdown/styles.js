import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { fontSizeLarge } from '/imports/ui/stylesheets/styled-components/typography';
import { lineHeightComputed } from '/imports/ui/stylesheets/styled-components/typography';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const Dropdown = styled.div`
  position: relative;
  z-index: 3;

  &:focus {
    outline: none;
  }
`;

const CloseButton = styled(Button)`
  display: none;
  position: fixed;
  bottom: 0.8rem;
  border-radius: 0;
  z-index: 1011;
  font-size: calc(${fontSizeLarge} * 1.1);
  width: calc(100% - (${lineHeightComputed} * 2));
  left: ${lineHeightComputed};
  box-shadow: 0 0 0 2rem ${colorWhite} !important;
  border: ${colorWhite} !important;

  @media ${smallOnly} {
    display: block;
  }
`;

export default {
  Dropdown,
  CloseButton,
};
