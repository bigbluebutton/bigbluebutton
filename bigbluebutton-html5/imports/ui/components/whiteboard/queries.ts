import { gql } from '@apollo/client';

// Interface for a single cursor coordinates object
export interface CursorCoordinates {
  xPercent: number;
  yPercent: number;
  userId: string;
}

// Interface for the response data
export interface CursorCoordinatesResponse {
  pres_page_cursor_stream: CursorCoordinates[];
}

export interface UserCursor {
  name: string;
  presenter: boolean;
  role: string;
}

export interface userCursorResponse {
  userId: string;
  isCurrentPage: boolean;
  lastUpdatedAt: string;
  pageId: string;
  presentationId: string;
  user: UserCursor;
}

// Interface for the pres_page_cursor subscription
export interface CursorSubscriptionResponse {
  pres_page_cursor: Array<userCursorResponse>;
}

export const CURRENT_PRESENTATION_PAGE_SUBSCRIPTION = gql`subscription CurrentPresentationPagesSubscription {
  pres_page_curr {
    height
    isCurrentPage
    num
    pageId
    scaledHeight
    scaledViewBoxHeight
    scaledViewBoxWidth
    scaledWidth
    svgUrl: urlsJson(path: "$.svg")
    width
    xOffset
    yOffset
    presentationId
    content
    downloadFileUri
    totalPages
    downloadable
    presentationName
    isDefaultPresentation
    infiniteWhiteboard
  }  
}`;

export const PRESENTATIONS_SUBSCRIPTION = gql`subscription PresentationsSubscription {
  pres_presentation {
    uploadInProgress
    current
    downloadFileUri
    downloadable
    uploadErrorDetailsJson
    uploadErrorMsgKey
    filenameConverted
    isDefault
    name
    totalPages
    totalPagesUploaded
    presentationId
    removable
    uploadCompleted
  }  
}`;

export const EXPORTING_PRESENTATIONS_SUBSCRIPTION = gql`subscription PresentationsSubscription {
  pres_presentation {
    uploadInProgress
    current
    downloadFileUri
    downloadable
    uploadErrorDetailsJson
    uploadErrorMsgKey
    filenameConverted
    isDefault
    name
    totalPages
    totalPagesUploaded
    presentationId
    removable
    uploadCompleted
    exportToChatInProgress
    exportToChatStatus
    exportToChatCurrentPage
    exportToChatHasError
  }  
}`;

export const PROCESSED_PRESENTATIONS_SUBSCRIPTION = gql`subscription ProcessedPresentationsSubscription {
  pres_presentation(where: { uploadCompleted: { _eq: true } }) {
    current
    name
    presentationId
  }
}`;

export const CURRENT_PAGE_ANNOTATIONS_QUERY = gql`query CurrentPageAnnotationsQuery {
  pres_annotation_curr(order_by: { lastUpdatedAt: desc }) {
    annotationId
    annotationInfo
    lastHistorySequence
    lastUpdatedAt
    pageId
    presentationId
    userId
  }  
}`;

export const CURRENT_PAGE_ANNOTATIONS_STREAM = gql`subscription annotationsStream($lastUpdatedAt: timestamptz){
  pres_annotation_curr_stream(batch_size: 1000, cursor: {initial_value: {lastUpdatedAt: $lastUpdatedAt}}) {
    annotationId
    annotationInfo
    lastUpdatedAt
    pageId
    presentationId
    userId
  }
}`;

export const CURRENT_PAGE_WRITERS_SUBSCRIPTION = gql`
  subscription currentPageWritersSubscription($pageId: String!) {
    pres_page_writers(where: { pageId: { _eq: $pageId } }) {
      userId
    }
  }
`;

export const CURRENT_PAGE_WRITERS_QUERY = gql`
  query currentPageWritersQuery($pageId: String!) {
    pres_page_writers(where: { pageId: { _eq: $pageId } }) {
      userId
      pageId
    }
  }
`;

export const cursorUserSubscription = gql`
  subscription CursorSubscription {
    pres_page_cursor(
      where: {isCurrentPage: {_eq: true}}
      order_by: { userId: asc }
    ) {
      userId
      user {
        name
        presenter
        role
      }
    }  
  }
`;

export const getCursorsCoordinatesStream = gql`
  subscription getCursorCoordinatesStream {
    pres_page_cursor_stream(cursor: {initial_value: {lastUpdatedAt: "2020-01-01"}}, 
                            where: {isCurrentPage: {_eq: true}}, 
                            batch_size: 100) {
      xPercent
      yPercent
      lastUpdatedAt
      userId
    }
  }
`;

export default CURRENT_PAGE_ANNOTATIONS_QUERY;
