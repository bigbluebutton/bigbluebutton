import { gql } from '@apollo/client';

export const USER_SEND_ACTIVITY_SIGN = gql`
  mutation UserSendActivitySign {
    userSendActivitySign
  }
`;

export default { USER_SEND_ACTIVITY_SIGN };
