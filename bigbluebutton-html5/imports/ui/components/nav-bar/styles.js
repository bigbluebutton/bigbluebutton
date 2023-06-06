import styled from 'styled-components';
import Icon from '/imports/ui/components/common/icon/component';
import { barsPadding, borderSize } from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  colorDanger,
  colorGrayDark,
  colorBackground,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import { phoneLandscape, smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';

const Navbar = styled.header`
  position: absolute;
  display: flex;
  flex-direction: column;
  text-align: center;
  font-size: 1.5rem;
  background-color: ${colorBackground};
  padding: ${barsPadding} ${barsPadding} 0 ${barsPadding};
`;

const Top = styled.div`
  display: flex;
  flex-direction: row;
`;

const Left = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const ArrowLeft = styled(Icon)`
  position: absolute;
  font-size: 40%;
  color: ${colorWhite};
  left: .25rem;
  @media ${smallOnly} {
    display: none;
  }
`;

const ArrowRight = styled(Icon)`
  position: absolute;
  font-size: 40%;
  color: ${colorWhite};
  right: .0125rem;
  @media ${smallOnly} {
    display: none;
  }
`;

const Center = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 70%;
  flex: 1;
`;

const PresentationTitle = styled.h1`
  font-weight: 400;
  color: ${colorWhite};
  font-size: ${fontSizeBase};
  margin: 0;
  padding: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 30vw;

  > [class^="icon-bbb-"] {
    font-size: 75%;
  }
`;

const Right = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex: 0;
`;

const Bottom = styled.div`
  display: flex;
  flex-direction: row;

  @media ${phoneLandscape} {
    margin-top: .25rem;
  }
`;

const NavbarToggleButton = styled(Button)`
  margin: 0;
  z-index: 3;

  ${({ hasNotification }) => hasNotification && `
    position: relative;

    &:after {
      content: '';
      position: absolute;
      border-radius: 50%;
      width: 12px;
      height: 12px;
      bottom: ${borderSize};
      right: 3px;
      background-color: ${colorDanger};
      border: ${borderSize} solid ${colorGrayDark};
    }
  `}
`;

export default {
  Navbar,
  Top,
  Left,
  ArrowLeft,
  ArrowRight,
  Center,
  PresentationTitle,
  Right,
  Bottom,
  NavbarToggleButton,
};
