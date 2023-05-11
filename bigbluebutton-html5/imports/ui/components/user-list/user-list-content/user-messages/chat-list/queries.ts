import { gql } from '@apollo/client';


export const CHATS_SUBSCRIPTION = gql`subscription {
    chat (order_by: [
        {public: desc}, 
        {totalUnread: desc}, 
        {participant: {
          name: asc,
          userId: asc,
        }}, 
    ]) {
        chatId
        meetingId
        participant {
            name
            role
            color
            loggedOut
            avatar
        }
        totalMessages
        totalUnread
        public
    }
}`;

export const CLOSE_PRIVATE_CHAT_MUTATION = gql`
    mutation UpdateChatUser($chatId: String) {
    update_chat_user(
        where: { chatId: { _eq: $chatId } },
        _set: { visible: false }
        ) {
        affected_rows
        }
    }
`
