import { gql } from '@apollo/client';

export const requestPresentationUploadTokenMutation = gql`
  mutation RequestPresentationUploadToken($podId: String!, $filename: String!,
  $uploadTemporaryId: String!, $pluginName: String!) {
    presentationRequestUploadToken(
      podId: $podId,
      filename: $filename,
      uploadTemporaryId: $uploadTemporaryId,
      pluginName: $pluginName,
    )
  }
`;

export default {
  requestPresentationUploadTokenMutation,
};
