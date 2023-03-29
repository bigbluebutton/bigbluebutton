import {useSubscription, gql, useQuery} from '@apollo/client';
 import React, { useState } from "react";

export default function ChatsInfo() {
  const { loading, error, data } = useSubscription(
    gql`subscription {
      chat {
        chatId
        meetingId
        participant {
            name
            role
            color
            loggedOut
        }
        totalMessages
        totalUnread
        public
      }
    }`
  );

  return  !loading && !error &&
    (<table border="1">
      <thead>
          <tr>
              <th colSpan="5">Chats available</th>
          </tr>
        <tr>
            <th>Id</th>
            <th>Meeting</th>
            <th>Participant</th>
            <th>Total Mgs</th>
            <th>Unread</th>
        </tr>
      </thead>
      <tbody>
        {data.chat.map((curr) => {
            console.log('chat', curr);
          return (
              <tr key={curr.chatId}>
                  <td>{curr.chatId}</td>
                  <td>{curr.meetingId}</td>
                  <td>{curr.participant?.name} {curr.participant?.role} {curr.participant?.color}  {curr.participant?.loggedOut == true ? ' (Offline)' : ''}</td>
                  <td>{curr.totalMessages}</td>
                  <td>{curr.totalUnread}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

