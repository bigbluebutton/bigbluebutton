import styled from 'styled-components';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';

const PresentationButton = styled(Button)`
  ${({ isDarkThemeEnabled }) => isDarkThemeEnabled && `
    & > span {
      color: ${colorWhite};
    }
  `}
`;

export default {
  PresentationButton,
};
