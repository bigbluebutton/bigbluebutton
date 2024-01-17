import { gql } from '@apollo/client';

export interface GetHasCurrentPresentationResponse {
  pres_page_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export interface UserInfo {
  user: {
    name: string;
    userId: string;
  };
  optionDescIds: Array<string>;
}

export interface ResponseInfo {
  optionResponsesCount: number;
  optionDesc: string;
  pollResponsesCount: number;
}

export interface PollInfo {
  published: boolean;
  pollId: string;
  secret: boolean;
  questionText: string;
  ended: boolean;
  multipleResponses: boolean;
  users: Array<UserInfo>;
  responses: Array<ResponseInfo>;
}

export interface getCurrentPollDataResponse {
  poll: Array<PollInfo>;
}

export const getHasCurrentPresentation = gql`
  subscription getHasCurrentPresentation {
    pres_page_aggregate(where: {isCurrentPage: {_eq: true}}) {
      aggregate {
        count
      }
    }
  }
`;

export const getCurrentPollData = gql`
subscription getCurrentPollData {
    poll(limit: 1) {
      pollId
      published
      secret
      questionText
      ended
      multipleResponses
      users(where: {responded: {_eq: true}}) {
        user {
          name
          userId
        }
        optionDescIds
      }
      responses {
        optionResponsesCount
        optionDesc
        pollResponsesCount
      }
    }
  }
`;

export default {
  getHasCurrentPresentation,
};
