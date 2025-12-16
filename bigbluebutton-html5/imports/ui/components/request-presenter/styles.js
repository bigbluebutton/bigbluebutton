import styled, { css } from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import Icon from '/imports/ui/components/common/icon/component';
import {
  colorPrimary,
  colorDanger,
  colorWhite,
  colorText,
  btnPrimaryHoverBg,
  btnDangerBgHover,
  btnPrimaryBg,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  jumboPaddingY,
  $2xlPadding,
  borderSizeSmall,
  appsButtonsBorderRadius,
  lgBorderRadius,
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

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0rem 1rem;
  margin-bottom: 1rem;
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 1.125rem;
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

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const NotificationActions = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 1.5rem;
  width: 100%;
`;

const ConfirmationButton = styled.button`
  background-color: ${btnPrimaryBg};
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: ${lgBorderRadius};
  font-size: 1rem;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3.5rem;

  &:hover {
    opacity: 0.8;
  }
`;

const CancelButton = styled.button`
  background-color: transparent;
  color: #333;
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 400;
  cursor: pointer;
  margin-right: 16px;
  border-radius: ${lgBorderRadius};
  border: none;

  &:hover {
    background-color: #f4f4f4;
  }
`;

const TitleText = styled.h3`
  font-size: 1.125rem;
  color: #333;
  font-weight: 700;
  margin-bottom: 8px;
`;

const DescriptionText = styled.p`
  font-size: 1rem;
  color: #666;
  text-align: left;
  margin: 0;
`;

const SvgCapsule = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PresenterIcon = styled(Icon)`
  font-size: 1.25rem;
  color: white;
`;

export default {
  RequestModal,
  Subtitle,
  UserInfo,
  UserName,
  RequestModalContent,
  RequestModalButton,
  NotificationContent,
  NotificationActions,
  ConfirmationButton,
  CancelButton,
  TitleText,
  DescriptionText,
  SvgCapsule,
  PresenterIcon,
};
