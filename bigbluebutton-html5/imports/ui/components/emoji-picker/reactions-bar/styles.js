import styled from 'styled-components';
import {
  colorOffWhite,
  colorGrayLightest,
  btnPrimaryHoverBg,
  btnPrimaryColor,
  btnPrimaryBg,
} from '/imports/ui/stylesheets/styled-components/palette';

const Wrapper = styled.div`
  display: flex;
  padding: .5rem;

  ${({ isMobile }) => isMobile && `
    flex-direction: column;
    align-items: center;
    padding: .5rem 0;
 `}
`;

const ButtonWrapper = styled.div`
  border: none;
  cursor: pointer;
  height: 2.5rem;
  width: 2.5rem;
  display: flex;
  align-items: center;
  border-radius: 50%;
  margin: 0 .5rem;

  &:hover {
    background-color: ${colorOffWhite};
  }

  & > button {
    cursor: pointer;
    flex: auto;
  }

  & > * > span {
    height: 1.8rem !important;
    width: 1.8rem !important;
  }

  ${({ active }) => active && `
    color: ${btnPrimaryColor};
    background-color: ${btnPrimaryBg};
    border: none;

    &:hover{
      filter: brightness(90%);
      color: ${btnPrimaryColor};
      background-color: ${btnPrimaryHoverBg} !important;
    }
  `}
`;

const RaiseHandButtonWrapper = styled(ButtonWrapper)`
  width: auto;
  border: 1px solid ${colorGrayLightest};
  border-radius: 1.7rem;
  padding: 1rem 0.5rem;

  ${({ active }) => active && `
    color: ${btnPrimaryColor};
    background-color: ${btnPrimaryBg};

    &:hover{
      filter: brightness(90%);
      color: ${btnPrimaryColor};
      background-color: ${btnPrimaryHoverBg} !important;
    }  
  `}
`

const Separator = styled.div`
  height: 2.5rem;
  width: 0;
  border: 1px solid ${colorGrayLightest};
  align-self: center;
  opacity: .75;

  ${({ isMobile }) => isMobile && `
    display: none;
 `}
`;

export default {
  Wrapper,
  ButtonWrapper,
  RaiseHandButtonWrapper,
  Separator,
};
