
import { gql } from "@apollo/client";

export const CURRENT_PRESENTATION_SUBSCRIPTION = gql`
subscription presentationCurrentSubscription {
    pres_page (where: {isCurrentPage: {_eq: true }}) {
        heightRatio
        isCurrentPage
        num
        pageId
        presentation {
            current
            downloadable
            presentationId
            removable
        }
        slideRevealed
        urls
        widthRatio
        xOffset
        yOffset
    }
}
`;
