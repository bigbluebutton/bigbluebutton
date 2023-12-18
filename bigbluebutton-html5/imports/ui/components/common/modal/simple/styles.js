import styled from 'styled-components';
import Styled from '../base/component';
import {
  borderSize,
  mdPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import ModalHeader from '/imports/ui/components/common/modal/header/component';

const SimpleModal = styled(Styled.BaseModal)`
  outline: transparent;
  outline-width: ${borderSize};
  outline-style: solid;
  display: flex;
  flex-direction: column;
  padding: ${mdPaddingX};
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  background-color: ${colorWhite} !important;
`;

const Header = styled(ModalHeader)``;

const Content = styled.div`
  overflow: visible;
  color: ${colorText};
  font-weight: normal;
  padding: 0;
`;

export default {
  SimpleModal,
  Header,
  Content,
};
