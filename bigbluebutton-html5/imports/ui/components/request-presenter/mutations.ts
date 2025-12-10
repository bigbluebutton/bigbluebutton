import { gql } from '@apollo/client';

export const USER_SET_PRESENTER_REQUEST = gql`
  mutation userSetPresenterRequest($requestedPresenter: Boolean!, $userId: String, $approved: Boolean) {
    userSetPresenterRequest(
      requestedPresenter: $requestedPresenter,
      userId: $userId,
      approved: $approved
    )
  }
`;

export default {
  USER_SET_PRESENTER_REQUEST,
};
