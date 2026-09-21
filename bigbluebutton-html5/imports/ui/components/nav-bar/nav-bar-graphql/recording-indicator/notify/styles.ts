import styled from 'styled-components';
import VisuallyHiddenStyles from '/imports/ui/components/common/visually-hidden/styles';
import ConfirmationModalStyles from '/imports/ui/components/common/modal/confirmation/styles';
import { lgPaddingY } from '/imports/ui/stylesheets/styled-components/general';

const Description = styled(ConfirmationModalStyles.Description)``;

const AppendDescription = styled(ConfirmationModalStyles.DescriptionText)`
  display: block;
  margin-top: ${lgPaddingY};
  overflow-wrap: anywhere;
  word-break: break-word;
`;

// BBButton's aria-labelledby points at its own visible label whenever one is
// set, which overrides its ariaLabel prop. The consent choices carry more
// context than "Continue"/"Leave session", so that context rides on a
// screenreader-only element the buttons point at instead.
const { VisuallyHidden: ScreenreaderLabel } = VisuallyHiddenStyles;

export default {
  Description,
  AppendDescription,
  ScreenreaderLabel,
};
