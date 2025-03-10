import { gql } from '@apollo/client';

export const GET_CURR_PRESS_PAGE_INFO = gql`
  subscription MySubscription {
    pres_page_curr {
      fitToWidth
      pageId
    }
  }
`;

export default {
  GET_CURR_PRESS_PAGE_INFO,
};
