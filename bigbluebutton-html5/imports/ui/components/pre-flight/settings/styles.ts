import styled from 'styled-components';
import {
  colorBorder,
  colorNeutral2,
  colorOffWhite,
  itemFocusBorder,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  jumboPaddingY,
  lgBorderRadius,
  lgPadding,
  mdPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  btnFontWeight,
  fontSizeBase,
} from '/imports/ui/stylesheets/styled-components/typography';

const Footer = styled.div`
  display: flex;
  flex: 0 0 auto;
  gap: ${jumboPaddingY};
  padding: ${jumboPaddingY};
  border-top: 1px solid ${colorBorder};
`;

// Half the row, as in the spec.
const SettingsButton = styled.button.attrs({ type: 'button' })`
  display: flex;
  flex: 0 1 calc(50% - ${jumboPaddingY} / 2);
  justify-content: center;
  align-items: center;
  gap: ${lgPadding};
  box-sizing: border-box;
  height: 3.5rem;
  padding: ${mdPaddingX};
  border: none;
  border-radius: ${lgBorderRadius};
  background: none;
  cursor: pointer;
  color: ${colorNeutral2};
  font-size: ${fontSizeBase};
  font-weight: ${btnFontWeight};

  &:hover {
    background-color: ${colorOffWhite};
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px ${itemFocusBorder};
  }
`;

export default {
  Footer,
  SettingsButton,
};
