import { gql } from '@apollo/client';
export const USER_IS_TALKING_SUBSCRIPTION = gql`
subscription {
  user_voice(where: {talking: {_eq: true}}) {
    muted
    userId
    voiceUserId
    meetingId
  }
}
`;
export default {
    USER_IS_TALKING_SUBSCRIPTION,
  };