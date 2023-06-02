import styled from "styled-components";
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

export const PopupContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  max-height: 40%;
  z-index: 10;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;
