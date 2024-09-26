import styled from 'styled-components';
import {
  colorPrimary,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import ModalStyles from '/imports/ui/components/common/modal/simple/styles';

const Content = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: .5rem 0 .5rem 0;
  overflow: hidden;
`;

const LayoutModal = styled(ModalSimple)`
  padding: 1rem;

  @media ${smallOnly} {
    height: unset;
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
  margin: 1rem 1rem 0.5rem 1rem;
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

    &:before {
      font-family: 'bbb-icons';
      color: ${colorWhite};
      position: fixed;
      content: "\\e946";
      background-color: ${colorPrimary};
      margin-left: 13.1rem;
      padding: 0.3rem 0.2rem 0 0.6rem;
      border-radius: 0 0 0 .3rem;

      [dir="rtl"] & {
        left: auto;
        margin-right: 13.1rem;
        margin-left: unset;
        padding: 0.3rem 0.6rem 0 0.2rem;
        border-radius: 0 0 .3rem 0;
      }
      width: 1.8rem;
      height: 1.8rem;

      @media ${smallOnly} {
        width: 1rem;
        height: 1rem;
        font-size: 0.6rem;
        margin-left: 4.5rem;
        padding: 0.2rem 0.2rem 0 0.3rem;

        [dir="rtl"] & {
          margin-right: 4.5rem;
          margin-left: unset;
          padding: 0.2rem 0.3rem 0 0.2rem;
        }
      }
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
  display: flex;
  justify-content: space-between;
  align-self: end;
  padding-left: 3rem;
  padding-right: 3rem;
  padding-top: 1rem;
  width: 100%;

  @media ${smallOnly} {
    align-self: center;
    padding-right: unset;
  }
`;

const LabelLayoutNames = styled.label`
  text-align: center;
  margin: 0 0 0.1rem 0;
`;

const ToggleLabel = styled.span`
  margin-right: .5rem;
  min-width: 4rem;
  text-align: end;
`;

const ToggleStatusWrapper = styled.div`
  display: flex;
  flex-grow: 0;
  justify-content: flex-end;
  align-items: center;
`;

const PushContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
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
  PushContainer,
  LabelPushLayout,
  ToggleStatusWrapper,
  ToggleLabel,
};
