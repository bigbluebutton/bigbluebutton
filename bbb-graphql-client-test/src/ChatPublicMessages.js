import {useSubscription, gql, useMutation} from '@apollo/client';
import usePatchedSubscription from "./usePatchedSubscription";
import React, {useState} from "react";

export default function ChatPublicMessages({userId}) {
    const [textAreaValue, setTextAreaValue] = useState(``);

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


    const [sendChatMessage] = useMutation(gql`
      mutation ChatSendMessage($chatId: String!, $message: String!) {
        chatSendMessage(
          chatId: $chatId,
          chatMessageInMarkdownFormat: $message
        )
  }
    `);

    const handleSendMessage = () => {
        if (textAreaValue.trim() !== '') {
            sendChatMessage({
                variables: {
                    chatId: 'MAIN-PUBLIC-GROUP-CHAT',
                    message: textAreaValue,
                },
            });

            setTextAreaValue('');
        }
    };


  const { loading, error, data } = usePatchedSubscription(
    gql`subscription {
      chat_message_public(limit: 20, order_by: {createdAt: desc}) {
        chatId
        chatEmphasizedText
        correlationId
        createdAt
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
            <th></th>
        </tr>
        </thead>
        <tbody>
        {data.map((curr) => {
            console.log('message', curr);
            return (
                <tr key={curr.messageId}>
                    <td>{curr.chatId}</td>
                    <td>{curr.senderName}</td>
                    <td>{curr.message}</td>
                    <td>{curr.createdAt}</td>
                    <td>
                        {
                            curr.senderId !== userId ?
                                <button onClick={() => handleUpdateLastSeen(curr.chatId, curr.createdTime)}>Read
                                    it!</button>
                                : ''
                        }
                    </td>
                </tr>
            );
        })}
        </tbody>
        <tfoot>
        <tr>
            <td colSpan={5}>
                <textarea name="test"
                          style={{height: '100px'}}
                          value={textAreaValue}
                          onChange={(e) => setTextAreaValue(e.target.value)}
                ></textarea>
                <button onClick={() => handleSendMessage()}>Send message!</button>
            </td>
        </tr>
        </tfoot>
    </table>);
}

