import {useSubscription, gql, useMutation} from '@apollo/client';

export default function ChatsInfo() {

    const [updateTypingAt] = useMutation(gql`
      mutation UpdateChatUser($chatId: String) {
        update_chat_user(
            where: { chatId: { _eq: $chatId } },
            _set: { typingAt: "now()" }
          ) {
            affected_rows
          }
      }
    `);

    const handleUpdateTypingAt = (chatId, lastSeenAt) => {
        updateTypingAt({
            variables: {
                chatId
            },
        });
    };

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

    const { data: dataTyping } = useSubscription(
      gql`subscription {
        user_typing_public(where: {isCurrentlyTyping: {_eq: true}}) {
            chatId
            isCurrentlyTyping
            meetingId
            typingAt
            userId
            user {
                name
            }
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
            <th>Who's typing</th>
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
                  <td>{curr.participant?.name} {curr.participant?.role} {curr.participant?.color}  {curr.participant?.loggedOut === true ? ' (Offline)' : ''}</td>
                      {
                          curr.chatId === 'MAIN-PUBLIC-GROUP-CHAT' ? (
                          <td>
                              {(dataTyping?.user_typing_public || []).map((currUserTyping) => <span>{currUserTyping.user.name} ({currUserTyping.userId})</span>)}
                              <br />
                              <button onClick={() => handleUpdateTypingAt(curr.chatId)}>I'm typing!</button>
                          </td>
                          ) : <td></td>
                      }
                  <td>{curr.totalMessages}</td>
                  <td>{curr.totalUnread}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

