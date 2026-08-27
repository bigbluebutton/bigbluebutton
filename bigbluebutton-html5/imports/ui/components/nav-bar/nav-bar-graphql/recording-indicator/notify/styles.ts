import styled from 'styled-components';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import ConfirmationModalStyles from '/imports/ui/components/common/modal/confirmation/styles';
import { lgPaddingY } from '/imports/ui/stylesheets/styled-components/general';

const RecordingNotifyModal = styled(ModalSimple)``;

const Container = styled(ConfirmationModalStyles.Container)`
  padding: 3.625em 0 3.625em 0;
`;

const Description = styled(ConfirmationModalStyles.Description)``;

const AppendDescription = styled(ConfirmationModalStyles.DescriptionText)`
  display: block;
  margin-top: ${lgPaddingY};
  overflow-wrap: anywhere;
  word-break: break-word;
`;

const Footer = styled(ConfirmationModalStyles.Footer)``;

// BBButton's aria-labelledby points at its own visible label whenever one is
// set, which overrides its ariaLabel prop. The consent choices carry more
// context than "Continue"/"Leave session", so that context rides on a
// screenreader-only element the buttons point at instead.
const ScreenreaderLabel = styled.span`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
`;

export default {
  RecordingNotifyModal,
  Container,
  Description,
  AppendDescription,
  Footer,
  ScreenreaderLabel,
};
