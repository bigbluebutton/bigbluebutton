import styled from 'styled-components';
import { colorGrayLighter } from '/imports/ui/stylesheets/styled-components/palette';

const ChatContent = styled.div`
  height: 100%;
  display: contents;
`;

const ChatMessages = styled.div`
  user-select: text;
`;

const Separator = styled.hr`
  margin: 1rem auto;
  width: 100%;
  border: 0;
  border-top: 1px solid ${colorGrayLighter};
`;

export default { ChatMessages, ChatContent, Separator };
