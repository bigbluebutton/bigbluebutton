import { gql } from '@apollo/client';

export interface GetHasCurrentPresentationResponse {
  pres_page_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export const getHasCurrentPresentation = gql`
subscription getHasCurrentPresentation {
  pres_page_aggregate(where: {isCurrentPage: {_eq: true}}) {
    aggregate {
      count
    }
  }
}`;

export default {
  getHasCurrentPresentation,
};
