import { gql } from '@apollo/client';
import { User } from '/imports/ui/Types/user';

export type GuestWaitingUser = {
  isAllowed: boolean
  guestLobbyMessage: string | null;
  isDenied: boolean;
  user: Partial<User>;
};

export interface GuestWaitingUsers {
  user_guest: Array<GuestWaitingUser>
}

export const GET_GUEST_WAITING_USERS_SUBSCRIPTION = gql`
  subscription getGuestWaitingUsers {
    user_guest(where: {isWaiting: {_eq: true}}) {
      guestLobbyMessage
      isAllowed
      isDenied
      userId
      user {
        authed
        userId
        name
        color
        role
        avatar
      }
    }
  }
`;

export default {
  GET_GUEST_WAITING_USERS_SUBSCRIPTION,
};
