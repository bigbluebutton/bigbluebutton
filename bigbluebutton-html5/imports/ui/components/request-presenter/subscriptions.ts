import { gql } from '@apollo/client';

export const PRESENTER_REQUEST_SUBSCRIPTION = gql`
  subscription presenterRequestSubscription {
    user(where: { requestedPresenter: { _eq: true } }) {
      userId
      name
      requestedPresenter
    }
  }
`;

export default { PRESENTER_REQUEST_SUBSCRIPTION };
