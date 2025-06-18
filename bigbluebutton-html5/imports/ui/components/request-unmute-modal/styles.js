import styled, { css } from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import {
  colorPrimary,
  colorDanger,
  colorWhite,
  colorText,
  btnPrimaryHoverBg,
  btnDangerBgHover,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  jumboPaddingY,
  $2xlPadding,
  borderSizeSmall,
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

const RequestModalButton = styled(Button)`
  margin: 0;
  font-weight: 400;
  
  font-size: 1.125rem;
  padding: ${$2xlPadding} ${jumboPaddingY};
  border-radius: 1.25rem;
  flex-grow: 0;

  i {
    font-size: 1.5rem;
  }

  ${({ color }) => color === 'primary' && css`
    background-color: ${colorPrimary};
    color: ${colorWhite};
    border: ${borderSizeSmall} solid ${colorPrimary};

    &:hover, &:focus {
      background-color: ${btnPrimaryHoverBg};
      border-color: ${btnPrimaryHoverBg};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'danger' && css`
    background-color: transparent;
    border: ${borderSizeSmall} solid ${colorDanger};
    color: ${colorDanger};

    i {
      color: ${colorDanger};
    }

    &:hover, &:focus {
      background-color: ${btnDangerBgHover};
      border-color: ${btnDangerBgHover};
      color: ${colorWhite};
      i {
        color: ${colorWhite};
      }
    }
  `}
`;

export default {
  RequestModal,
  Subtitle,
  RequestModalContent,
  RequestModalButton,
};
