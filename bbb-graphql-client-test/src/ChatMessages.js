import {useSubscription, gql, useQuery, useMutation} from '@apollo/client';
 import React, { useState } from "react";

export default function ChatMessages({userId}) {
    const [updateLastSeen] = useMutation(gql`
      mutation UpdateChatUser($chatId: String, $lastSeenAt: bigint) {
        update_chat_user(
            where: { chatId: { _eq: $chatId }, lastSeenAt: { _lt: $lastSeenAt } },
            _set: { lastSeenAt: $lastSeenAt }
          ) {
            affected_rows
          }
      }
    `);

    const handleUpdateLastSeen = (chatId, lastSeenAt) => {
        updateLastSeen({
            variables: {
                chatId,
                lastSeenAt
            },
        });
    };

  const { loading, error, data } = useSubscription(
    gql`subscription {
      chat_message_private(order_by: [{senderName: asc}, {createdTime: asc}]) {
        chatEmphasizedText
        chatId
        correlationId
        createdTime
        createdTimeAsDate
        meetingId
        message
        messageId
        senderId
        senderName
        senderRole
      }
    }`
  );

  return  !loading && !error &&
    (<table border="1">
      <thead>
        <tr>
            <th colSpan="4">Private Chat Messages</th>
        </tr>
        <tr>
            <th>ChatId</th>
            <th>Sender</th>
            <th>Message</th>
            <th>Sent At</th>
            <th></th>
        </tr>
      </thead>
      <tbody>
        {data.chat_message_private.map((curr) => {
            console.log('message', curr);
          return (
              <tr key={curr.messageId}>
                  {/*<td>{user.userId}</td>*/}
                  <td>{curr.chatId}</td>
                  <td>{curr.senderName}</td>
                  <td>{curr.message}</td>
                  <td>{curr.createdTimeAsDate} ({curr.createdTime})</td>
                  <td>
                      {
                          curr.senderId !== userId ?
                              <button onClick={() => handleUpdateLastSeen(curr.chatId, curr.createdTime)}>Read it!</button>
                              : ''
                      }
                  </td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

