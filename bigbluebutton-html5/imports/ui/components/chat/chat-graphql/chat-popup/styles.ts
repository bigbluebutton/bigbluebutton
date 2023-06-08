import styled from 'styled-components';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

export const PopupContainer = styled.div`
  display: flex;
  min-height: 20%;
  flex-direction: column;
  z-index: 10;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;
