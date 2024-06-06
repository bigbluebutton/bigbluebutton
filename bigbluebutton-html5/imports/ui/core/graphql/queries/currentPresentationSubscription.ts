import { gql } from '@apollo/client';

const CURRENT_PRESENTATION_SUBSCRIPTION = gql`
subscription currentPresentationSubscription {
    pres_presentation (where: {current: {_eq: true}}) {
        presentationId
        pages (where: {isCurrentPage: {_eq: true}}) {
            num
            pageId
            urlsJson
            svgUrl: urlsJson(path: "$.svg")
        }
    }
}
`;
export default CURRENT_PRESENTATION_SUBSCRIPTION;
