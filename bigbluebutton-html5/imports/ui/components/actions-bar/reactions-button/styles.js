import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';

import {
  colorWhite,
  colorGrayDark,
  colorGrayLightest,
  btnPrimaryColor,
  btnPrimaryActiveBg,
} from '/imports/ui/stylesheets/styled-components/palette';

const ReactionsButton = styled(Button)`
${({ ghost }) => ghost && `
  & > span {
    box-shadow: none;
    background-color: transparent !important;
    border-color: ${colorWhite} !important;
  }
   `}
`;

const ReactionsDropdown = styled.div`
  position: relative;
`;

const ButtonWrapper = styled.div`
  border: 1px solid transparent;
  cursor: pointer;
  height: 2.5rem;
  display: flex;
  align-items: center;
  border-radius: 50%;
  margin: 0 .5rem;

  &:focus {
    background-color: ${colorGrayDark};
  }

  & > button {
    cursor: pointer;
    flex: auto;
  }

  & > * > span {
    padding: 4px;
    color: ${colorGrayDark} !important;
    border-color: transparent !important;
  }

  & i {
    width: 1.3rem;
  }

  ${({ active }) => active && `
    color: ${btnPrimaryColor};
    background-color: ${btnPrimaryActiveBg};

    &:hover{
      filter: brightness(90%);
      color: ${btnPrimaryColor};
      background-color: ${btnPrimaryActiveBg} !important;
    }
  `}
`;

const ReactionsButtonWrapper = styled(ButtonWrapper)`
  width: 2.5rem;
  border-radius: 1.7rem;


  ${({ isMobile }) => !isMobile && `
    border: 1px solid ${colorGrayLightest};
    padding: 1rem 0.5rem;
    width: auto;
  `}

  ${({ active }) => active && `
    color: ${btnPrimaryColor};
    background-color: ${btnPrimaryActiveBg};

    &:hover{
      filter: brightness(90%);
      color: ${btnPrimaryColor};
      background-color: ${btnPrimaryActiveBg} !important;
    }  
  `}
`;

const ToggleButtonWrapper = styled(ButtonWrapper)`
  width: auto;
  padding: 1rem 0.5rem;
  cursor: inherit;
  & > div {
    margin-right: 0.5rem;
    filter: grayscale(100%);
  }
  &:hover {
    background-color: transparent !important;
  }
`;

export default {
  ReactionsButton,
  ReactionsDropdown,
  ButtonWrapper,
  ReactionsButtonWrapper,
  ToggleButtonWrapper,
};
