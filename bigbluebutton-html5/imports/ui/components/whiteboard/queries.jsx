import { gql } from '@apollo/client';

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
    urls
    width
    xOffset
    yOffset
    presentationId
    content
    downloadFileUri
    numPages
    downloadable
    presentationName
    isDefaultPresentation
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
  pres_annotation_curr_stream(batch_size: 10, cursor: {initial_value: {lastUpdatedAt: $lastUpdatedAt}}) {
    annotationId
    annotationInfo
    lastUpdatedAt
    pageId
    presentationId
    userId
  }
}`;

export const CURRENT_PAGE_WRITERS_SUBSCRIPTION = gql`subscription currentPageWritersSubscription {
  pres_page_writers {
    userId
  }
}`;

export default CURRENT_PAGE_ANNOTATIONS_QUERY;
