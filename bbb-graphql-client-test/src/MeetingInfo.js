import {gql, useQuery} from '@apollo/client';

export default function MeetingInfo() {
  const { loading, error, data } = useQuery(
    gql`query {
      meeting {
        meetingId
        createdTime
        disabledFeatures
        durationInSeconds
        extId
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
            <th>durationInSeconds</th>
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
                  <td>{curr.durationInSeconds}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

