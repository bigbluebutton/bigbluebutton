import styled from 'styled-components';
import { colorTextDefault } from '@bigbluebutton/bbb-ui-components-react';
import {
  colorWhiteSurface,
  colorOffWhite,
  colorGrayLabel,
  colorGrayUserListToolbar,
  colorBlueAux,
  colorNeutral2,
  itemFocusBorder,
  colorPrimary,
  colorBorder,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderRadiusRounded,
  mdPaddingX,
  lgPaddingX,
  smPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeBase,
  fontSizeLarge,
  fontSizeSmall,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import { mediumOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import PreFlightStyled from '../styles';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;

  /* A tablet in the phone layout: the panel fills its tab. */
  ${PreFlightStyled.PHONE_LAYOUT} & {
    @media ${mediumOnly} {
      flex: 1 0 auto;
    }
  }
`;

// The setup column's title; the rule under it is the setup panel's own
// separator, so both cards draw it at the same height.
const Title = PreFlightStyled.PanelTitle;

// Cards on one side, what the pick means on the other, while both fit; stacked
// once the column is too narrow for two, and always in the phone layout.
const Body = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  /* Side by side, the one row stretches and the summary is as tall as the
     panel; stacked, the cards take what they need and the summary the rest. */
  grid-template-rows: auto;
  grid-auto-rows: 1fr;
  gap: ${lgPaddingX};
  flex: 1;
  min-height: 0;
  padding: ${lgPaddingX};
  overflow: auto;

  /* A tablet in the phone layout fits two columns, but the summary goes under
     the cards there too. */
  ${PreFlightStyled.PHONE_LAYOUT} & {
    grid-template-columns: 1fr;
    padding: ${mdPaddingX};
    overflow: visible;

    /* On a tablet the summary takes the height left under the cards, and
       never less than it needs once more modes fill the screen. */
    @media ${mediumOnly} {
      flex: 1 0 auto;
    }
  }
`;

const Picker = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${mdPaddingX};
  min-width: 0;
`;

const Heading = styled.h3`
  margin: 0;
  color: ${colorTextDefault};
  font-size: ${fontSizeLarge};
  font-weight: ${textFontWeight};
`;

const Description = styled.p`
  margin: 0;
  color: ${colorGrayLabel};
  font-size: ${fontSizeSmall};
`;

const Cards = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${mdPaddingX};
`;

const Card = styled.button.attrs({ type: 'button' })<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${mdPaddingX};
  width: 100%;
  padding: ${mdPaddingX};
  border: 1px solid ${({ $selected }) => ($selected ? colorPrimary : colorBorder)};
  border-radius: ${borderRadiusRounded};
  background-color: ${({ $selected }) => ($selected ? colorGrayUserListToolbar : colorWhiteSurface)};
  color: ${colorText};
  font: inherit;
  text-align: start;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${itemFocusBorder};
    outline-offset: 2px;
  }

  &[aria-disabled='true'] {
    cursor: default;
    opacity: 0.6;
  }
`;

// The design's 48px tile: grey and neutral until picked, tinted once it is.
const CardIcon = styled.span<{ $selected: boolean }>`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: ${borderRadiusRounded};
  background-color: ${({ $selected }) => ($selected ? colorBlueAux : colorGrayUserListToolbar)};
  color: ${({ $selected }) => ($selected ? colorPrimary : colorNeutral2)};
`;

const CardText = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${smPadding};
  min-width: 0;
`;

const CardName = styled.span`
  display: flex;
  align-items: center;
  gap: ${smPadding};
  color: ${colorTextDefault};
  font-size: ${fontSizeBase};

  & > svg {
    color: ${colorPrimary};
    font-size: ${fontSizeLarge};
  }
`;

const CardHint = styled.span`
  color: ${colorGrayLabel};
  font-size: ${fontSizeSmall};
`;

const Summary = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${mdPaddingX};
  padding: ${lgPaddingX};
  justify-content: center;
  border: 1px solid ${colorBorder};
  border-radius: ${borderRadiusRounded};
  text-align: center;
`;

// The design draws it at 277x156; it shrinks with a narrow summary.
const Illustration = styled.img`
  width: 17.3125rem;
  max-width: 100%;
  height: auto;
`;

const EmptyState = styled.p`
  max-width: 20rem;
  margin: 0;
  color: ${colorText};
  font-size: ${fontSizeBase};
`;

const Selected = styled.div`
  display: flex;
  align-items: center;
  align-self: stretch;
  gap: ${mdPaddingX};
  padding: ${mdPaddingX};
  border-radius: ${borderRadiusRounded};
  background-color: ${colorOffWhite};
  text-align: start;
`;

const SelectedText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${smPadding};
`;

const SelectedLabel = styled.span`
  color: ${colorGrayLabel};
  font-size: ${fontSizeSmall};
`;

const SelectedName = styled.span`
  color: ${colorTextDefault};
  font-size: ${fontSizeLarge};
`;

export default {
  Panel,
  Title,
  Body,
  Picker,
  Heading,
  Description,
  Cards,
  Card,
  CardIcon,
  CardText,
  CardName,
  CardHint,
  Summary,
  Illustration,
  EmptyState,
  Selected,
  SelectedText,
  SelectedLabel,
  SelectedName,
};
