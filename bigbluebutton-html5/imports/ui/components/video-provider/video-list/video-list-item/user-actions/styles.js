import styled from 'styled-components';
import { colorOffWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { TextElipsis, DivElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';
import { landscape, mediumUp } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { fontSizeSmaller } from '/imports/ui/stylesheets/styled-components/typography';
import Button from '/imports/ui/components/common/button/component';

const DropdownTrigger = styled(DivElipsis)`
  position: relative;
  // Keep the background with 0.5 opacity, but leave the text with 1
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  color: ${colorOffWhite};
  padding: 0 1rem 0 .5rem !important;
  font-size: 80%;
  cursor: pointer;
  white-space: nowrap;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  &::after {
    content: "\\203a";
    position: absolute;
    transform: rotate(90deg);
    ${({ isRTL }) => isRTL && `
      transform: rotate(-90deg);
    `}
    top: 45%;
    width: 0;
    line-height: 0;
    right: .45rem;
  }
`;

const UserName = styled(TextElipsis)`
  position: relative;
  // Keep the background with 0.5 opacity, but leave the text with 1
  color: ${colorOffWhite};
  padding: 0 1rem 0 .5rem !important;
  font-size: 80%;

  ${({ noMenu }) => noMenu && `
    padding: 0 .5rem 0 .5rem !important;
  `}
`;

const Dropdown = styled.div`
  display: flex;
  outline: none !important;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  display: inline-block;

  @media ${mediumUp} {
    >[aria-expanded] {
      padding: .25rem;
    }
  }

  @media ${landscape} {
    button {
      width: calc(100vw - 4rem);
      margin-left: 1rem;
    }
  }

  ${({ isFirefox }) => isFirefox && `
    max-width: 100%;
  `}
`;

const MenuWrapper = styled.div`
  max-width: 75%;
`;

const MenuWrapperSqueezed = styled.div`
  position: absolute;
  right: 0;
  top: 0;
`;

const OptionsButton = styled(Button)`
  position: absolute;
  right: 7px;
  top: 7px;
  z-index: 2;
  background-color: rgba(0,0,0,0.4);
  color: ${colorOffWhite};
  overflow: hidden;
  border: none !important;
  padding: 3px;

  i {
    width: auto;
    font-size: ${fontSizeSmaller} !important;
    background-color: transparent !important;
  }

  &,
  &:active,
  &:focus,
  &:hover {
    background-color: rgba(0,0,0,0.5) !important;
    border: none !important;
    color: white !important;
    opacity: 100% !important;
  }
  
  &:hover {
    transform: scale(1.3);
    transition-duration: 150ms;
  }
`;

export default {
  DropdownTrigger,
  UserName,
  Dropdown,
  MenuWrapper,
  MenuWrapperSqueezed,
  OptionsButton,
};
