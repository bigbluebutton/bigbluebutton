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

export default { SET_POLICY, SUBMIT_APPROVAL_STATUS };
