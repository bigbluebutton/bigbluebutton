import {useSubscription, gql, useMutation} from '@apollo/client';
import React from "react";
import usePatchedSubscription from "./usePatchedSubscription";

export default function UserLocalSettings({userId}) {

    const [updateLocalSettings] = useMutation(gql`
      mutation UpdateUserLocalSettings($userId: String, $settingsJson: jsonb) {
        update_user_localSettings(
            where: { userId: { _eq: $userId } },
            _set: { settingsJson: $settingsJson }
          ) {
            affected_rows
          }
      }
    `);

    const handleUpdateLocalSettings = (userId, settingsJson) => {
        updateLocalSettings({
            variables: {
                userId,
                settingsJson
            },
        });
    };

  const { loading, error, data } = usePatchedSubscription(
    gql`subscription {
      user_localSettings {
        userId
        settingsJson
      }
    }`
  );

  return  !loading && !error &&
    (<table border="1">
      <thead>
          <tr>
              <th colSpan={2}>Local Settings
                  <button onClick={() => handleUpdateLocalSettings(userId,
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
            <th>settingsJson</th>
        </tr>
      </thead>
      <tbody>
        {data.map((curr) => {
          return (
              <tr key={curr.userId}>
                  <td>{JSON.stringify(curr.settingsJson)}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

