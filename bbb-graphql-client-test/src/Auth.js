import {gql, useMutation, useSubscription} from '@apollo/client';
import React from "react";
import UserList from './UserList';
import MeetingInfo from './MeetingInfo';
import TotalOfUsers from './TotalOfUsers';
import TotalOfModerators from './TotalOfModerators';
import TotalOfViewers from './TotalOfViewers';
import TotalOfUsersTalking from './TotalOfUsersTalking';
import TotalOfUniqueNames from './TotalOfUniqueNames';
import ChatMessages from "./ChatMessages";
import ChatsInfo from "./ChatsInfo";
import ChatPublicMessages from "./ChatPublicMessages";
import PluginDataChannel from "./PluginDataChannel";
import Annotations from "./Annotations";
import AnnotationsHistory from "./AnnotationsHistory";
import CursorsStream from "./CursorsStream";
import CursorsAll from "./CursorsAll";
import TalkingStream from "./TalkingStream";
import MyInfo from "./MyInfo";
import UserClientSettings from "./UserClientSettings";
import UserConnectionStatus from "./UserConnectionStatus";
import UserConnectionStatusReport from "./UserConnectionStatusReport";
import PresPresentationUploadToken from "./PresPresentationUploadToken";

export default function Auth() {

    //where is not necessary once user can update only its own status
    //Hasura accepts "now()" as value to timestamp fields
    const [updateUserClientEchoTestRunningAtMeAsNow] = useMutation(gql`
      mutation UpdateUserClientEchoTestRunningAt {
        update_user_current(
            where: {}
            _set: { echoTestRunningAt: "now()" }
          ) {
            affected_rows
          }
      }
    `);

    const handleUpdateUserEchoTestRunningAt = () => {
        updateUserClientEchoTestRunningAtMeAsNow();
    };

    const [dispatchUserJoin] = useMutation(gql`
      mutation UserJoin($authToken: String!, $clientType: String!) {
        userJoinMeeting(
          authToken: $authToken,
          clientType: $clientType,
        )
      }
    `);

    const handleDispatchUserJoin = (authToken) => {
        dispatchUserJoin({
            variables: {
                authToken: authToken,
                clientType: 'HTML5',
            },
        });
    };

    const [dispatchUserLeave] = useMutation(gql`
      mutation UserLeaveMeeting {
        userLeaveMeeting
      }
    `);
    const handleDispatchUserLeave = (authToken) => {
        dispatchUserLeave();
    };


  const { loading, error, data } = useSubscription(
    gql`subscription {
      user_current {
        userId
        authToken
        name
        loggedOut
        ejected
        isOnline
        isModerator
        joined
        joinErrorCode
        joinErrorMessage
        guestStatus
        guestStatusDetails {
          guestLobbyMessage
          positionInWaitingQueue
        }
        meeting {
            name
            ended
        }
      }
    }`
  );

  if(!loading && !error) {

      if(!data.hasOwnProperty('user_current') ||
          data.user_current.length == 0
      ) {
          return <div><br />Error: User not found</div>;
      }

    return (<div>
        <br />
        {data.user_current.map((curr) => {
            console.log('user_current', curr);

            if(curr.meeting.ended) {
                return <div>
                    {curr.meeting.name}
                    <br/><br/>
                    Meeting has ended.</div>
            } else if(curr.ejected) {
                return <div>
                    {curr.meeting.name}
                    <br/><br/>
                    You left the meeting.</div>
            } else if(curr.ejected) {
                return <div>
                    {curr.meeting.name}
                    <br/><br/>
                    You were ejected from the meeting.</div>
            } else if(curr.guestStatus !== 'ALLOW') {
                return <div>
                    {curr.meeting.name}
                    <br/><br/>
                    <span>You are waiting for approval.</span>
                    <span>{curr.guestStatusDetails.guestLobbyMessage}</span>
                    <span>Your position is: {curr.guestStatusDetails.positionInWaitingQueue}</span>
                </div>
            } else if(!curr.joined) {
                return <div>
                    {curr.meeting.name}
                    <br/><br/>
                    <span>You didn't join yet.</span>
                    <button onClick={() => handleDispatchUserJoin(curr.authToken)}>Join Now!</button>
                </div>
            } else if(curr.isOnline) {
                return <div>
                    {curr.meeting.name}
                    <br/><br/>
                    <span>You are online, welcome {curr.name} ({curr.userId})</span>
                    <button onClick={() => handleDispatchUserLeave()}>Leave Now!</button>

                    <MyInfo userAuthToken={curr.authToken} />
                    <br />

                    <MeetingInfo />
                    <br />

                    <TotalOfUsers />
                    <TotalOfModerators />
                    <TotalOfViewers />
                    <TotalOfUsersTalking />
                    <TotalOfUniqueNames />
                    <br />
                    <UserList user={curr} />

                    <br />
                    <UserConnectionStatus />
                    <br />
                    <UserConnectionStatusReport />
                    <br />
                    <UserClientSettings userId={curr.userId} />
                    <br />
                    <ChatsInfo />
                    <br />
                    <ChatMessages userId={curr.userId} />
                    <br />
                    <ChatPublicMessages userId={curr.userId} />
                    <br />
                    <CursorsAll />
                    <br />
                    <TalkingStream />
                    <br />
                    <CursorsStream />
                    <br />
                    <Annotations />
                    <br />
                    <AnnotationsHistory />
                    <br />

                    <PluginDataChannel userId={curr.userId} />
                    <br />

                    <PresPresentationUploadToken />
                    <br />

                </div>
            }


        })}
    </div>)
  }
}

