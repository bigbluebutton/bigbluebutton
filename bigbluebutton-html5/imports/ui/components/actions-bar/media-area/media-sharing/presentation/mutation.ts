import { gql } from '@apollo/client';

export const requestPresentationUploadTokenMutation = gql`
  mutation RequestPresentationUploadToken(
    $podId: String!,
    $filename: String!,
    $uploadTemporaryId: String!,
    $insertIntoPresentationId: String,
    $insertAtPosition: Int,
    $insertSeenTotalPages: Int,
    $insertNavigate: Boolean,
  ) {
    presentationRequestUploadToken(
      podId: $podId,
      filename: $filename,
      uploadTemporaryId: $uploadTemporaryId,
      insertIntoPresentationId: $insertIntoPresentationId,
      insertAtPosition: $insertAtPosition,
      insertSeenTotalPages: $insertSeenTotalPages,
      insertNavigate: $insertNavigate,
    )
  }
`;

export default {
  requestPresentationUploadTokenMutation,
};
