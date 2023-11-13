import {useSubscription, gql, useMutation} from '@apollo/client';
import React from "react";
import usePatchedSubscription from "./usePatchedSubscription";

export default function PresPresentationUploadToken({userId}) {

    const [requestPresentationUploadToken] = useMutation(gql`
      mutation RequestPresentationUploadToken($podId: String!, $filename: String!, $uploadTemporaryId: String!) {
        requestPresentationUploadToken(
          podId: $podId,
          filename: $filename,
          uploadTemporaryId: $uploadTemporaryId,
        )
      }
    `);

    const handleRequestPresentationUploadToken = (filename) => {
        requestPresentationUploadToken({
            variables: {
                podId: 'DEFAULT_PRESENTATION_POD',
                filename,
                uploadTemporaryId: 'PRES' + new Date().getTime(),
            },
        });
    };

  const { loading, error, data } = usePatchedSubscription(
    gql`subscription {
          pres_presentation_uploadToken {
            presentationId
            uploadTemporaryId
            uploadToken
          }
        }`
  );

  return  !loading && !error &&
    (<table border="1">
      <thead>
          <tr>
              <th colSpan={2}>Upload Token
                  <button onClick={() => handleRequestPresentationUploadToken('myfile.pdf')}>Request new Token!</button>
              </th>
          </tr>
        <tr>
            <th>presentationId</th>
            <th>uploadTemporaryId</th>
            <th>uploadToken</th>
        </tr>
      </thead>
      <tbody>
        {data.map((curr) => {
          return (
              <tr key={curr.uploadTemporaryId}>
                  <td>{curr.presentationId}</td>
                  <td>{curr.uploadTemporaryId}</td>
                  <td>{curr.uploadToken}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

