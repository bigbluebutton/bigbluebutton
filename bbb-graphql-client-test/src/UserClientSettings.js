import {useSubscription, gql, useMutation} from '@apollo/client';
import React from "react";
import usePatchedSubscription from "./usePatchedSubscription";

export default function UserClientSettings({userId}) {

    const [updateClientSettings] = useMutation(gql`
      mutation UpdateUserClientSettings($userId: String, $userClientSettingsJson: jsonb) {
        update_user_clientSettings(
            where: { userId: { _eq: $userId } },
            _set: { userClientSettingsJson: $userClientSettingsJson }
          ) {
            affected_rows
          }
      }
    `);

    const handleUpdateClientSettings = (userId, userClientSettingsJson) => {
        updateClientSettings({
            variables: {
                userId,
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
              <th colSpan={2}>Local Settings
                  <button onClick={() => handleUpdateClientSettings(userId,
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

