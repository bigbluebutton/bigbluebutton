import styled from 'styled-components';
import { barsPadding, mobileNavbarButtonGap, lgPadding } from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  colorBackground,
  colorGray,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeBase, fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';
import { phoneLandscape, smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

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

  @media ${smallOnly} {
    min-width: 0;
  }
`;

const PresentationTitle = styled.h1`
  font-weight: 400;
  color: ${colorWhite};
  font-size: ${fontSizeBase};
  margin: 0;
  padding: ${lgPadding};
  white-space: nowrap;
  overflow: hidden;
  max-width: 30vw;

  @media ${smallOnly} {
    min-width: 0;
    max-width: 100%;
    font-size: ${fontSizeSmall};
  }
`;

const TitleButton = styled.button`
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-width: 0;

  &:focus-visible {
    outline: 2px solid ${colorWhite};
    border-radius: 2px;
  }

  > [class^="icon-bbb-"] {
    font-size: 75%;
    flex-shrink: 0;
  }

  @media ${smallOnly} {
    padding: 0 0.3rem;
  }
  & span i {
    margin-left: .5rem;
    margin-right: .5rem;
  }
`;

const TitleText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

  @media ${smallOnly} {
    gap: ${mobileNavbarButtonGap};
    padding-left: ${mobileNavbarButtonGap};

    & > * {
      margin: 0 !important;
      padding: 0 !important;
      display: flex;
      align-items: center;
    }

    & > *:last-child {
      margin-left: calc(-1 * ${mobileNavbarButtonGap}) !important;
    }
  }
`;

const Bottom = styled.div`
  display: flex;
  flex-direction: row;

  @media ${phoneLandscape} {
    margin-top: .25rem;
  }
`;

export default {
  Navbar,
  Top,
  Left,
  Center,
  PresentationTitle,
  TitleButton,
  TitleText,
  Right,
  Bottom,
  PluginInfoComponent,
  PluginComponentWrapper,
  PluginSeparatorWrapper,
};
