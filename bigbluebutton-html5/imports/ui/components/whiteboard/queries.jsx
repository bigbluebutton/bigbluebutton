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
    urlsJson
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

export const PROCESSED_PRESENTATIONS_SUBSCRIPTION = gql`subscription ProcessedPresentationsSubscription {
  pres_presentation(where: { uploadInProgress: { _is_null: true }, uploadCompleted: { _eq: true } }) {
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
