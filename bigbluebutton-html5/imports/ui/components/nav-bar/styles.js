import styled from 'styled-components';
import { barsPadding, borderSize } from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  colorDanger,
  colorGrayDark,
  colorBackground,
  colorGray,
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

const ItemsGroup = `
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Left = styled.div`
  ${ItemsGroup}
  justify-content: flex-start;
`;

const Center = styled.div`
  ${ItemsGroup}
  justify-content: center;
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
  cursor: pointer;

  > [class^="icon-bbb-"] {
    font-size: 75%;
  }

  @media ${smallOnly} {
    padding: 0 0.3rem;
  }
  & span i {
    margin-left: .5rem;
    margin-right: .5rem;
    font-size: .75rem;
  }
`;

const PluginInfoComponent = styled.h1`
  font-weight: 400;
  color: ${colorWhite};
  font-size: ${fontSizeBase};
  margin: 0;
  padding: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 30vw;
`;

const PluginComponentWrapper = styled.div`
  margin: 0 .5rem;
`;

const PluginSeparatorWrapper = styled.div`
  color: ${colorGray};
  font-size: ${fontSizeBase};
  margin: 0 1rem;
`;

const Right = styled.div`
  ${ItemsGroup}
  justify-content: flex-end;
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
  Center,
  PresentationTitle,
  Right,
  Bottom,
  NavbarToggleButton,
  PluginInfoComponent,
  PluginComponentWrapper,
  PluginSeparatorWrapper,
};
