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

export default {
    CHATS_SUBSCRIPTION
};
