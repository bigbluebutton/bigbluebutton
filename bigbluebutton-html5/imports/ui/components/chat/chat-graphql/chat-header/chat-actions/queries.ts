import { gql } from "@apollo/client";
import { User} from '/imports/ui/Types/user'
import { Meeting } from "/imports/ui/Types/meeting";
import { Message } from "/imports/ui/Types/message";

export type getChatMessageHistory = {
  chat_message_public: Array<Message>
  meeting: Array<Meeting>;
  user_welcomeMsgs: Array<{welcomeMsg: string, welcomeMsgForModerators: string | null}>;
};

export type getPermissions = {
  user_current: Array<User>;
  meeting: Array<{ isBreakout: boolean }>;
  user_welcomeMsgs: Array<{ welcomeMsg: string; welcomeMsgForModerators: string | null }>;
};

export const GET_CHAT_MESSAGE_HISTORY  = gql`
query getChatMessageHistory {
  chat_message_public(order_by: {createdTime: asc}) {
    message
    messageId
    createdTime
    user {
      userId
      name
      role
    }
  }
  meeting {
    name
  }
  user_welcomeMsgs {
    welcomeMsg
    welcomeMsgForModerators
  }
}
`;

export const GET_PERMISSIONS = gql`
  query getPermissions {
    user_current {
      isModerator
    }
    meeting {
      isBreakout
      name
    }
    user_welcomeMsgs {
      welcomeMsg
      welcomeMsgForModerators
    }
  }
`;
