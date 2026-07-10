import styled from 'styled-components';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import ConfirmationModalStyles from '/imports/ui/components/common/modal/confirmation/styles';

const RecordingNotifyModal = styled(ModalSimple)``;

const Container = styled(ConfirmationModalStyles.Container)`
  padding: 3.625em 0 3.625em 0;
`;

const Description = styled(ConfirmationModalStyles.Description)``;

const Footer = styled(ConfirmationModalStyles.Footer)``;

export default {
  RecordingNotifyModal,
  Container,
  Description,
  Footer,
};
