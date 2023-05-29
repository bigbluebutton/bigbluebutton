import styled from 'styled-components';

const DropdownMenuWrapper = styled.div`
    display: inline-block;

    &[aria-disabled="true"] {
    cursor: not-allowed;
    opacity: .5;
    box-shadow: none;
    pointer-events: none;
  }
`;

export default {
  DropdownMenuWrapper,
};
