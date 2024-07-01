import { gql } from '@apollo/client';

export interface GuestUserApprovalStatus {
  guest: string;
  status: string;
}

export const SET_POLICY = gql`
  mutation SetPolicy($guestPolicy: String!) {
    guestUsersSetPolicy(
      guestPolicy: $guestPolicy,
    )
  }
`;

export const SUBMIT_APPROVAL_STATUS = gql`
  mutation SubmitApprovalStatus($guests: [GuestUserApprovalStatus]!) {
    guestUsersSubmitApprovalStatus(
      guests: $guests,
    )
  }
`;

export const SET_LOBBY_MESSAGE = gql`
  mutation SetLobbyMessage($message: String!) {
    guestUsersSetLobbyMessage(
      message: $message,
    )
  }
`;

export const SET_LOBBY_MESSAGE_PRIVATE = gql`
  mutation SetLobbyMessage($guestId: String!, $message: String!) {
    guestUsersSetLobbyMessagePrivate(
      guestId: $guestId,
      message: $message,
    )
  }
`;

export default {
  SET_POLICY,
  SUBMIT_APPROVAL_STATUS,
  SET_LOBBY_MESSAGE,
  SET_LOBBY_MESSAGE_PRIVATE,
};
