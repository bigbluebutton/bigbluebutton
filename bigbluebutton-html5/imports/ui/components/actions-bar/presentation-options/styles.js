import styled from 'styled-components';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';

const PresentationButton = styled(Button)`
  & > span {
      color: ${colorWhite};
      background-color: transparent !important;
    }

  ${({ isDarkThemeEnabled }) => isDarkThemeEnabled && `
    & > span {
      color: ${colorWhite};
    }
  `}
`;

export default {
  PresentationButton,
};
