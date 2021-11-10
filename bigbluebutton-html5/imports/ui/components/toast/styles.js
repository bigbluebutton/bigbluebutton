import styled from 'styled-components';
import Icon from '../icon/component';
import {
  fontSizeSmallest,
  fontSizeSmaller,
} from '/imports/ui/stylesheets/styled-components/typography';
import { colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';
import { toastOffsetSm } from '/imports/ui/stylesheets/styled-components/general';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const CloseIcon = styled(Icon)`
  background: transparent;
  outline: none;
  border: none;
  cursor: pointer;
  opacity: .5;
  font-size: ${fontSizeSmallest};
  color: ${colorGrayDark};
  line-height: 0;
  position: relative;
  font-size: 70%;
  left: ${toastOffsetSm};
  
  [dir="rtl"] & {
    left: auto;
    right: ${toastOffsetSm};
  }

  ${({ animations }) => animations && `
    transition: .3s ease;
  `}

  &:before {
    margin: inherit inherit inherit -.4rem;

    [dir="rtl"] & {
      margin: inherit -.4rem inherit inherit;
    }
  }

  &:hover,
  &:focus {
    opacity: 1;
  }

  @media ${smallOnly} {
    position: relative;
    font-size: ${fontSizeSmaller};
    left: auto;
  }
`;

export default {
  CloseIcon,
};
