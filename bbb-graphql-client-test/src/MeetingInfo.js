import {useSubscription, gql, useQuery} from '@apollo/client';
 import React, { useState } from "react";

export default function MeetingInfo() {
  const { loading: usersLoading, error: usersError, data: meetingInfo } = useQuery(
    gql`query {
      meeting {
        createdTime
        disabledFeatures
        duration
        extId
        html5InstanceId
        isBreakout
        maxPinnedCameras
        meetingCameraCap
        name
        notifyRecordingIsOn
        presentationUploadExternalDescription
        presentationUploadExternalUrl
      }
    }`
  );

  return  !usersLoading && !usersError &&
    (<table border="1">
      <thead>
        <tr>
            {/*<th>Id</th>*/}
            <th>Name</th>
            <th>extId</th>
            <th>duration</th>
        </tr>
      </thead>
      <tbody>
        {meetingInfo.meeting.map((meeting) => {
            console.log('meeting', meeting);
          return (
              <tr key={meeting.meetingId}>
                  {/*<td>{user.userId}</td>*/}
                  <td>{meeting.name}</td>
                  <td>{meeting.extId}</td>
                  <td>{meeting.duration}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

