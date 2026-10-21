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
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderRadiusRounded,
  mdPaddingX,
  lgPaddingX,
  smPadding,
  lgPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeBase,
  fontSizeLarge,
  fontSizeSmall,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import PreFlightStyled from '../styles';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

// The setup column's title, with the rule the design draws under both panels'.
const Title = styled(PreFlightStyled.PanelTitle)`
  padding-bottom: ${lgPaddingX};
  border-bottom: 1px solid ${colorBorder};
`;

// Cards on one side, what the pick means on the other, while both fit; stacked
// once the column is too narrow for two (a tablet beside the setup panel, a
// phone).
const Body = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: ${lgPaddingX};
  flex: 1;
  min-height: 0;
  padding: ${lgPaddingX};
  overflow: auto;

  @media ${smallOnly} {
    padding: ${mdPaddingX};
    overflow: visible;
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

// Only as tall as what it holds: stretched beside the cards, it was a large
// bordered box around a line of text.
const Summary = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: start;
  gap: ${mdPaddingX};
  padding: ${lgPaddingX};
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
