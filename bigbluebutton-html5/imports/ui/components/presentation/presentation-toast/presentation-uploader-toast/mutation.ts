import { gql } from '@apollo/client';

const SET_PRESENTATION_RENDERED_IN_TOAST = gql`
  mutation PresentationSetRenderedInToast($presentationId: String!) {
    presentationSetRenderedInToast(
      presentationId: $presentationId,
    )
  }
`;

export default SET_PRESENTATION_RENDERED_IN_TOAST;
