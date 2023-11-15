import { gql } from '@apollo/client';

export const CURSOR_SUBSCRIPTION = gql`subscription CursorSubscription {
  pres_page_cursor {
    isCurrentPage
    lastUpdatedAt
    pageId
    presentationId
    userId
    xPercent
    yPercent
    user {
      name
      presenter
      role
    }
  }  
}`;

export default CURSOR_SUBSCRIPTION;
