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

export default {
  RecordingNotifyModal,
  Container,
  Description,
  AppendDescription,
  Footer,
};
