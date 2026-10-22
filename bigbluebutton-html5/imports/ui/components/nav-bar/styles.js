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

  ${({ $overflowEnabled }) => $overflowEnabled && `
    /* Anchors the collapsed slots, which are laid out out of flow, inside this row. */
    position: relative;

    /* An item that shrank instead would never free enough room to trigger the collapse. */
    [data-overflow-item] {
      flex-shrink: 0;
    }

    /* Items that render nothing (e.g. recording disabled) must not add a gap. */
    [data-overflow-item]:empty {
      display: none;
    }

    /* As in the actions bar, the room kept between the center and each side group is held as
       margins, so items collapse before a side group gets closer to the center than the buttons
       are to each other. Desktop buttons already carry half of that spacing in their own margins;
       on small screens the right group's padding already keeps it. A left group without items
       has nothing to keep away from the center. */
    > :first-child:not(:empty) {
      margin-inline-end: ${lgPadding};
    }

    > :last-child {
      margin-inline-start: ${lgPadding};
    }

    @media ${smallOnly} {
      > :first-child:not(:empty) {
        margin-inline-end: ${mobileNavbarButtonGap};
      }

      > :last-child {
        margin-inline-start: 0;
      }
    }
  `}
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

  /* Small viewports let the title shrink to an equal share even beside an empty group, so with
     items collapsed the room they freed would otherwise go to that empty group. */
  ${({ $hasOverflow }) => $hasOverflow && `
    @media ${smallOnly} {
      flex-basis: auto;
    }
  `}
`;

const PresentationTitle = styled.h1`
  font-weight: 400;
  color: ${colorWhite};
  font-size: ${fontSizeBase};
  margin: 0;
  padding: 0;
  white-space: nowrap;
  overflow: hidden;
  max-width: 30vw;

  @media ${smallOnly} {
    min-width: 0;
    max-width: 100%;
    font-size: ${fontSizeSmall};
    padding: ${lgPadding};
  }

  /* The title holds its full width, as without the collapse, until the items around it leave
     less room than that; then it truncates instead of pushing the row past the bar's edge. */
  ${({ $overflowEnabled }) => $overflowEnabled && `
    max-width: min(30vw, var(--nav-bar-title-room, 30vw));

    @media ${smallOnly} {
      max-width: 100%;
    }
  `}
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
    padding-inline-start: ${mobileNavbarButtonGap};

    & > *,
    & > [data-overflow-item] > * {
      margin: 0 !important;
      padding: 0 !important;
      display: flex;
      align-items: center;
    }

    & > [data-overflow-item] {
      gap: ${mobileNavbarButtonGap};
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
