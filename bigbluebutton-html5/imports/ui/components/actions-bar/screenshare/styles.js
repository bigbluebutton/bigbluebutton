import styled from 'styled-components';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';

const ScreenShareModal = styled(ModalSimple)``;

const Container = styled.span`
  display: flex;
  flex-flow: row;
  position: relative;

  & > div {
    position: relative;
  }

  & > :last-child {
    margin-right: 0;
  }
`;
export default {
  ScreenShareModal,
  Container,
};
