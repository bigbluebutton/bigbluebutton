import React, { useState, useEffect } from 'react';
import { gql, useSubscription } from '@apollo/client';

const MEETING_SUBSCRIPTION = gql`
  subscription {
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
  }
`;

export default function MeetingInfo() {
    const [shouldSubscribe, setShouldSubscribe] = useState(false);

    useEffect(() => {
        // Generate a random delay between 1 and 5 seconds
        const randomDelay = Math.floor(Math.random() * 5000) + 1000;

        const timer = setTimeout(() => {
            setShouldSubscribe(true);
        }, randomDelay);

        // Clean up the timer when the component unmounts
        return () => clearTimeout(timer);
    }, []);

    const { loading, error, data } = useSubscription(
        MEETING_SUBSCRIPTION,
        { skip: !shouldSubscribe, shouldResubscribe: [] } // Skip the subscription until shouldSubscribe is true
    );

    if (!shouldSubscribe || data == null) {
        return <p>Loading...</p>;
    }

    console.log(data);

    return !loading && !error && (
        <table border="1">
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
        </table>
    );
}
