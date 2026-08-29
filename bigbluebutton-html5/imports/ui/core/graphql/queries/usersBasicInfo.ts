import { gql } from '@apollo/client';

const USERS_BASIC_INFO_SUBSCRIPTION = gql`
  subscription UsersBasicInfo {
    user(order_by: {nameSortable: asc, userId: asc}) {
      meetingId
      userId
      extId
      name
      nameSortable
      bot
      isModerator
      color
      role
      avatar
      presenter
    }
  }
`;

export default USERS_BASIC_INFO_SUBSCRIPTION;
