import {useSubscription, gql, useMutation} from '@apollo/client';
import React from "react";
import usePatchedSubscription from "./usePatchedSubscription";

export default function UserClientSettings({userId}) {

    const [updateClientSettings] = useMutation(gql`
      mutation UpdateUserClientSettings($userClientSettingsJson: jsonb) {
        update_user_clientSettings(
            where: {}
            _set: { userClientSettingsJson: $userClientSettingsJson }
          ) {
            affected_rows
          }
      }
    `);

    const handleUpdateClientSettings = (userClientSettingsJson) => {
        updateClientSettings({
            variables: {
                userClientSettingsJson
            },
        });
    };

  const { loading, error, data } = usePatchedSubscription(
    gql`subscription {
      user_clientSettings {
        userId
        userClientSettingsJson
      }
    }`
  );

  return  !loading && !error &&
    (<table border="1">
      <thead>
          <tr>
              <th colSpan={2}>User Client Settings
                  <button onClick={() => handleUpdateClientSettings(
                      {
                          application: {
                              animations : true,
                              chatAudioAlerts : false
                          }
                      }
                      )}>Update now!</button>
              </th>
          </tr>
        <tr>
            <th>userClientSettingsJson</th>
        </tr>
      </thead>
      <tbody>
        {data.map((curr) => {
          return (
              <tr key={curr.userId}>
                  <td>{JSON.stringify(curr.userClientSettingsJson)}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

