import styled from 'styled-components';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import ConfirmationModalStyles from '/imports/ui/components/common/modal/confirmation/styles';

const AwayNotifyModal = styled(ModalSimple)``;

const Container = styled(ConfirmationModalStyles.Container)`
  padding: 1rem 0 2rem 0;
`;

const Description = styled(ConfirmationModalStyles.Description)``;

const Footer = styled(ConfirmationModalStyles.Footer)``;

const NotifyButton = styled(ConfirmationModalStyles.ConfirmationButton)``;

export default {
  AwayNotifyModal,
  Container,
  Description,
  Footer,
  NotifyButton,
};
