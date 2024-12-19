import styled from 'styled-components';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';

const RaiseHandButton = styled(Button)`
  ${({ ghost }) => ghost && `
    & > span {
      box-shadow: none;
      background-color: transparent !important;
      border-color: ${colorWhite} !important;
    }
  `}
  
  & span i {
    left: -.05rem;
  }
`;

const Dropdown = styled.ul`
  position: absolute;
  bottom: 100%;
  left: 0;
  transform: translateY(-0.5rem);
  margin: 0;
  padding: 0.5rem;
  list-style: none;
  background-color: ${colorWhite};
  border: 1px solid #ccc;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  white-space: nowrap;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease-in-out;
  &:hover {
    background-color: #0F70D7;
  }
`;

const DropdownItem = styled.li`
  padding: 0.5rem 1rem;
  cursor: pointer;
  background-color: #f9f9f9;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #0F70D7;
    color: ${colorWhite};
  }
`;

export default {
  RaiseHandButton,
  Dropdown,
  DropdownItem,
};
