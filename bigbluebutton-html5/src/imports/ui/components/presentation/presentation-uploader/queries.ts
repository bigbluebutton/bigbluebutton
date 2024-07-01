import { gql } from '@apollo/client';

export const getPresentationUploadToken = gql`
  query getPresentationUploadToken ($uploadTemporaryId: String!){
    pres_presentation_uploadToken(where: {uploadTemporaryId: {_eq: $uploadTemporaryId}}) {
      presentationId
      uploadTemporaryId
      uploadToken
    }
  }
`;

export default {
  getPresentationUploadToken,
};
