import styled from 'styled-components';
import { colorGrayDark, colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import {
  jumboPaddingY,
  lgPaddingX,
  lgPaddingY,
  titlePositionLeft,
  modalMargin,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeLarge } from '/imports/ui/stylesheets/styled-components/typography';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import Button from '/imports/ui/components/common/button/component';

const MultiScreenSharePermissionsModal = styled(ModalSimple)``;

const Container = styled.div`
  margin: 0 ${modalMargin} ${lgPaddingX};
`;

const Description = styled.div`
  text-align: center;
  color: ${colorGray};
  margin-bottom: ${jumboPaddingY};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default {
  MultiScreenSharePermissionsModal,
  Container,
  Description,
  Content,
};
