import styled from 'styled-components';
import {
  colorPrimary,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';
import Modal from '/imports/ui/components/common/modal/simple/component';
import ModalStyles from '/imports/ui/components/common/modal/simple/styles';

const Content = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: .5rem 0 .5rem 0;
  overflow: hidden;
  min-height: 30rem;
`;

const LayoutModal = styled(Modal)`
  padding: 1rem;
  min-height: 44rem;

  @media ${smallOnly} {
    height: unset;
    min-height: 22.5rem;
  }

   ${({ isPhone }) => isPhone && `
    min-height: 100%;
    min-width: 100%;
    border-radius: 0;
  `}

  ${ModalStyles.Content} {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const IconSvg = styled.img`
  height: 8rem;
  border-radius: 5px;
  margin: 5px;

  @media ${smallOnly} {
    height: 3rem;
    margin: 1px;
  }
`;

const LayoutBtn = styled(Button)`
  display: flex;
  box-shadow: unset !important;
  background-color: ${colorWhite};
  border: ${colorWhite} solid 6px;
  align-items: center;
  flex-direction: column;
  padding: 0 !important;
  margin: 0.5rem 1rem 1rem 1rem;
  width: fit-content;

  @media ${smallOnly} {
    margin: 0.5rem;
    border: ${colorWhite} solid 4px;
    border-radius: 10px;
    width: fit-content;
  }

  &:focus,
  &:hover {
    border: ${colorPrimary} solid 6px;
    border-radius: 5px;
  }
  
  ${({ active }) => (active === 'true') && `
    border: ${colorPrimary} solid 6px;
    border-radius: 5px;

    @media ${smallOnly} {
      border: ${colorPrimary} solid 4px;
      border-radius: 5px;
    }
  `};
`;

const ButtonLayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  @media ${smallOnly} {
    align-items: center;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  @media ${smallOnly} {
    flex-wrap: unset;
    flex-direction: column;
    align-items: center;
  }
`;

const ButtonBottomContainer = styled.div`
  align-self: end;
  padding-right: 3rem;
  padding-top: 1rem;

  @media ${smallOnly} {
    align-self: center;
    padding-right: unset;
  }
`;

const LabelLayoutNames = styled.label`
  text-align: center;
  margin: 0 0 0.1rem 0;
`;

const BottomButton = styled(Button)`
  margin: 0 0.5rem;
`;

const PushContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0 1rem 0;
`;

const LabelPushLayout = styled.div`
  padding-right: 0.5rem;
`;

export default {
  Content,
  LayoutModal,
  BodyContainer,
  IconSvg,
  LayoutBtn,
  ButtonLayoutContainer,
  ButtonsContainer,
  ButtonBottomContainer,
  LabelLayoutNames,
  BottomButton,
  PushContainer,
  LabelPushLayout,
};
