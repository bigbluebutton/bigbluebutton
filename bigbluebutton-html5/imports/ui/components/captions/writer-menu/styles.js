import styled from 'styled-components';
import {
  borderSize,
  borderSizeLarge,
  mdPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  colorLink,
  colorGrayLighter,
  colorGrayLabel,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';
import Modal from '/imports/ui/components/common/modal/simple/component';

const WriterMenuModal = styled(Modal)`
  min-height: 20rem;
`;

const Content = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: .3rem 0 0.5rem 0;
`;

const StartBtn = styled(Button)`
  align-self: center;
  margin: 0;
  display: block;
  position: absolute;
  bottom: ${mdPaddingX};
  color: ${colorWhite} !important;
  background-color: ${colorLink} !important;

  &:focus {
    outline: none !important;
  }

  & > i {
    color: #3c5764;
  }
`;

const WriterMenuSelect = styled.div`
  width: 40%;

  & > select {
    background-color: ${colorWhite};
    border: ${borderSize} solid ${colorWhite};
    border-radius: ${borderSize};
    border-bottom: 0.1rem solid ${colorGrayLighter};
    color: ${colorGrayLabel};
    width: 100%;
    height: 1.75rem;
    padding: 1px;

    &:hover {
      outline: transparent;
      outline-style: dotted;
      outline-width: ${borderSize};
    }

    &:focus {
      outline: none;
      box-shadow: inset 0 0 0 ${borderSizeLarge} ${colorPrimary};
      border-radius: ${borderSize};
      outline: transparent;
      outline-width: ${borderSize};
      outline-style: solid;
    }
  }
`;

export default {
  WriterMenuModal,
  Content,
  StartBtn,
  WriterMenuSelect,
};
