import styled from 'styled-components';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

export const PopupContainer = styled.div`
  position: sticky;
  top: 0;
  max-height: 80%;
  z-index: 3;
`;

export const PopupContents = styled(ScrollboxVertical)`
  height: 100%;
`;
