import styled from 'styled-components';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import {
  colorWhite,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  $2xlPadding,
  appsButtonsBorderRadius,
} from '/imports/ui/stylesheets/styled-components/general';

const RequestModal = styled(ModalSimple)`
  padding: ${$2xlPadding};

  border-radius: ${appsButtonsBorderRadius};
  background-color: ${colorWhite};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  button[class*="close"] {
    top: ${$2xlPadding};
    right: ${$2xlPadding};
    
    i {
      font-size: 1.5rem !important;
    }
  }
`;

const Subtitle = styled.p`
  display: block;
  text-align: left;
  font-size: 1rem;
  padding: 0rem 1rem;
  padding-bottom: 1.5rem;
  margin-top: 0rem;
  color: ${colorText};
`;

const RequestModalContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${$2xlPadding};
  margin-top: 1rem;
  padding: 1rem;
`;

export default {
  RequestModal,
  Subtitle,
  RequestModalContent,
};
