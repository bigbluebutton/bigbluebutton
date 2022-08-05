import styled from 'styled-components';
import Modal from '/imports/ui/components/common/modal/simple/component';
import ConfirmationModalStyles from '/imports/ui/components/common/modal/confirmation/styles';

const RecordingNotifyModal = styled(Modal)``;

const Container = styled(ConfirmationModalStyles.Container)`
  padding: 3.625em 0 3.625em 0;
`;

const Header = styled(ConfirmationModalStyles.Header)``;

const Title = styled(ConfirmationModalStyles.Title)``;

const Description = styled(ConfirmationModalStyles.Description)``;

const Footer = styled(ConfirmationModalStyles.Footer)``;

const NotifyButton = styled(ConfirmationModalStyles.ConfirmationButton)``;

export default {
  RecordingNotifyModal,
  Container,
  Header,
  Title,
  Description,
  Footer,
  NotifyButton,
};
