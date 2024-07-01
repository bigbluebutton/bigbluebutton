import { gql } from '@apollo/client';

const BREAKOUT_COUNT = gql`
  subscription BreakoutCount {
    breakoutRoom_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export {
  BREAKOUT_COUNT,
};

export default {
  BREAKOUT_COUNT,
};
