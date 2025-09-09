import { gql } from '@apollo/client';

export interface UserInfo {
  user: {
    name: string;
    userId: string;
  };
  optionDescIds: Array<string>;
}

export interface ResponseInfo {
  correctOption: boolean;
  optionResponsesCount: number;
  optionDesc: string;
  pollResponsesCount: number;
}

export interface PollInfo {
  quiz: boolean;
  published: boolean;
  pollId: string;
  secret: boolean;
  questionText: string;
  ended: boolean;
  multipleResponses: boolean;
  users: Array<UserInfo>;
  responses: Array<ResponseInfo>;
  users_aggregate: {
    aggregate: {
      count: number;
    };
  };
  responses_aggregate: {
    aggregate: {
      count: number;
      sum: {
        optionResponsesCount: number;
      }
    };
  };
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
    poll(order_by: {createdAt: desc}, limit: 1,) {
      pollId
      published
      secret
      questionText
      ended
      multipleResponses
      quiz
      users {
        user {
          name
          userId
        }
        optionDescIds
      }
      responses(order_by: {optionId: asc}) {
        correctOption
        optionResponsesCount
        optionDesc
        pollResponsesCount
      }
      users_aggregate {
        aggregate {
          count
        }
      }
      responses_aggregate {
        aggregate {
          count
          sum {
            optionResponsesCount
          }
        }
      }
    }
  }
`;
