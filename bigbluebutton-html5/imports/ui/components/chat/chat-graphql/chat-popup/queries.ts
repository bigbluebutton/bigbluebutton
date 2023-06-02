import { gql } from "@apollo/client";

export interface WelcomeMsgsResponse {
  user_welcomeMsgs: Array<{welcomeMsg: string | null, welcomeMsgForModerators: string | null}>
}

export const GET_WELCOME_MESSAGE = gql`
  query {
    user_welcomeMsgs {
      welcomeMsg
      welcomeMsgForModerators
    }
  }
`;