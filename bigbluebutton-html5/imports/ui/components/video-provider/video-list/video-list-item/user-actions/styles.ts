// @ts-nocheck
/* eslint-disable */
import styled from 'styled-components';
import { colorOffWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { TextElipsis, DivElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';
import { landscape, mediumUp } from '/imports/ui/stylesheets/styled-components/breakpoints';

const DropdownTrigger = styled(DivElipsis)<{
  $isRTL: boolean;
}>`
  user-select: none;
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
    ${({ $isRTL }) => $isRTL && `
      transform: rotate(-90deg);
    `}
    top: 45%;
    width: 0;
    line-height: 0;
    right: .45rem;
  }
`;

const UserName = styled(TextElipsis)<{
  $noMenu: boolean;
}>`
  position: relative;
  // Keep the background with 0.5 opacity, but leave the text with 1
  color: ${colorOffWhite};
  padding: 0 1rem 0 .5rem !important;
  font-size: 80%;

  ${({ $noMenu }) => $noMenu && `
    padding: 0 .5rem 0 .5rem !important;
  `}
`;

const Dropdown = styled.div<{
  $isFirefox: boolean;
}>`
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

  ${({ $isFirefox }) => $isFirefox && `
    max-width: 100%;
  `}
`;

const MenuWrapper = styled.div`
  max-width: 60%;
`;

export default {
  DropdownTrigger,
  UserName,
  Dropdown,
  MenuWrapper,
};
