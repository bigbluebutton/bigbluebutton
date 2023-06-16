import styled from 'styled-components';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

export const PopupContainer = styled.div`
  display: contents;
  max-height: 80%;
`;

export const PopupContents = styled(ScrollboxVertical)`
  height: 100%;
  overflow: auto;
`;
