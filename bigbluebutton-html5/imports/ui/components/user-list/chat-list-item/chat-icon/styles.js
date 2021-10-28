import styled from 'styled-components';

import { colorGrayLight } from '/imports/ui/stylesheets/styled-components/palette';

const ChatThumbnail = styled.div`
  display: flex;
  flex-flow: column;
  color: ${colorGrayLight};
  justify-content: center;
  font-size: 175%;
`;

export default {
  ChatThumbnail,
};
