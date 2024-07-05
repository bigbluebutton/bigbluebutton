import { gql } from '@apollo/client';

export const MEETING_END = gql`
  mutation {
    meetingEnd
  }
`;

export default { MEETING_END };
