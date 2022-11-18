import styled from 'styled-components';
import { colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';
import { borderRadius } from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';

const PushMessageContent = styled.div`
  margin-top: 1.4rem;
  margin-bottom: .4rem;
  margin-left: .4rem;
  margin-right: .4rem;
  background-color: inherit;
  width: 98%;
`;

const UserNameMessage = styled.h3`
  margin: 0;
  font-size: 80%;
  color: ${colorGrayDark};
  font-weight: bold;
  background-color: inherit;
  position: relative;
  white-space: nowrap; 
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1em;
  max-height: 1em;
`;

const ContentMessage = styled.div`
  margin-top: ${borderRadius};
  font-size: 80%;
  background-color: inherit;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: ${fontSizeSmall};
  max-height: calc(${fontSizeSmall} * 10);
`;

const ContentMessagePoll = styled(ContentMessage)`
  margin-top: ${fontSizeSmall};
`;

export default {
  PushMessageContent,
  UserNameMessage,
  ContentMessage,
  ContentMessagePoll,
};
