import {useSubscription, gql, useQuery} from '@apollo/client';
 import React, { useState } from "react";

export default function ChatPublicMessages() {
  const { loading, error, data } = useSubscription(
    gql`subscription {
      chat_message_public(order_by: {createdTime: asc}) {
        chatId
        chatEmphasizedText
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
            <th colSpan="4">Public Chat Messages</th>
        </tr>
        <tr>
            <th>ChatId</th>
            <th>Sender</th>
            <th>Message</th>
            <th>Sent At</th>
        </tr>
      </thead>
      <tbody>
        {data.chat_message_public.map((curr) => {
            console.log('message', curr);
          return (
              <tr key={curr.messageId}>
                  <td>{curr.chatId}</td>
                  <td>{curr.senderName}</td>
                  <td>{curr.message}</td>
                  <td>{curr.createdTimeAsDate} ({curr.createdTime})</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

