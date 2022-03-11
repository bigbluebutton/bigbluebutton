import styled from 'styled-components';
import Modal from '/imports/ui/components/common/modal/simple/component';
import RecordingModalStyles from '/imports/ui/components/recording/styles';

const RecordingNotifyModal = styled(Modal)``;

const Container = styled(RecordingModalStyles.Container)`
  padding: 3.625em 0 3.625em 0;
`;

const Header = styled(RecordingModalStyles.Header)``;

const Title = styled(RecordingModalStyles.Title)``;

const Description = styled(RecordingModalStyles.Description)``;

const Footer = styled(RecordingModalStyles.Footer)``;

const NotifyButton = styled(RecordingModalStyles.RecordingButton)``;

export default {
  RecordingNotifyModal,
  Container,
  Header,
  Title,
  Description,
  Footer,
  NotifyButton,
};
