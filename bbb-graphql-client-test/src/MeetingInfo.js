import {gql, useQuery} from '@apollo/client';

export default function MeetingInfo() {
  const { loading, error, data } = useQuery(
    gql`query {
      meeting {
        meetingId
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

  return  !loading && !error &&
    (<table border="1">
      <thead>
      <tr>
          <th colSpan={3}>Meeting Info</th>
      </tr>
        <tr>
            {/*<th>Id</th>*/}
            <th>Name</th>
            <th>extId</th>
            <th>duration</th>
        </tr>
      </thead>
      <tbody>
        {data.meeting.map((curr) => {
            console.log('meeting', curr);
          return (
              <tr key={curr.meetingId}>
                  {/*<td>{user.userId}</td>*/}
                  <td>{curr.name}</td>
                  <td>{curr.extId}</td>
                  <td>{curr.duration}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

