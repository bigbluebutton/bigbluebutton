import { gql } from '@apollo/client';

export const CURRENT_PRESENTATION_PAGE_SUBSCRIPTION = gql`subscription CurrentPresentationPagesSubscription {
  pres_page_curr {
    height
    heightRatio
    isCurrentPage
    num
    pageId
    scaledHeight
    scaledViewBoxHeight
    scaledViewBoxWidth
    scaledWidth
    slideRevealed
    urls
    viewBoxHeight
    viewBoxWidth
    width
    widthRatio
    xOffset
    yOffset
    presentationId
  }  
}`;

export const CURRENT_PAGE_ANNOTATIONS_SUBSCRIPTION = gql`subscription CurrentPageAnnotationsSubscription {
  pres_annotation_curr {
    annotationId
    annotationInfo
    lastHistorySequence
    lastUpdatedAt
    pageId
    presentationId
    userId
  }  
}`;


export default CURRENT_PRESENTATION_PAGE_SUBSCRIPTION;
