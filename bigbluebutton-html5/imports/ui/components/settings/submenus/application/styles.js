import styled from 'styled-components';
import { colorGrayLabel } from '/imports/ui/stylesheets/styled-components/palette';
import SpinnerStyles from '/imports/ui/components/common/loading-screen/styles';
import SubMenusStyle from '/imports/ui/components/settings/submenus/styles';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';

const SpinnerOverlay = styled(SpinnerStyles.Spinner)`
  & > div {
    background-color: black;
  }
`;

const ToggleGroup = styled(SubMenusStyle.Group)`
  gap: 0.25rem;
`;

const BoldLabel = styled.label`
  color: ${colorGrayLabel};
  font-size: ${fontSizeBase};
  font-weight: bold;
`;

const ExampleText = styled.p`
  flex-grow: 1;
  margin: 0;
  color: ${colorGrayLabel};
`;

export default {
  SpinnerOverlay,
  Bounce1: SpinnerStyles.Bounce1,
  Bounce2: SpinnerStyles.Bounce2,
  BoldLabel,
  ExampleText,
  ToggleGroup,
};
