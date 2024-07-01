import { gql } from '@apollo/client';

export interface WelcomeMsgsResponse {
  // eslint-disable-next-line camelcase
  user_welcomeMsgs: Array<{welcomeMsg: string | null, welcomeMsgForModerators: string | null}>
}

export const GET_WELCOME_MESSAGE = gql`
  query getWelcomeMessage{
    user_welcomeMsgs {
      welcomeMsg
      welcomeMsgForModerators
    }
  }
`;
