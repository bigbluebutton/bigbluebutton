import { gql } from '@apollo/client';

export interface MentionUser {
  userId: string;
  name: string;
  /** Announced with the name of namesakes: what a screen reader has instead of the avatar. */
  extId: string;
  color: string;
  avatar: string;
  isModerator: boolean;
  // The rest feeds the shared avatar content: reaction, away, dial-in and breakout room.
  away: boolean;
  reactionEmoji: string;
  isDialIn: boolean;
  lastBreakoutRoom?: { sequence: number; isUserCurrentlyInRoom: boolean } | null;
}

export interface GetMentionUsersResponse {
  user: MentionUser[];
}

export const GET_MENTION_USERS = gql`
  subscription GetMentionUsers($where: user_bool_exp, $limit: Int!) {
    user(
      where: $where,
      limit: $limit,
      order_by: [
        { nameSortable: asc },
        { userId: asc }
      ]
    ) {
      userId
      name
      extId
      color
      avatar
      isModerator
      away
      reactionEmoji
      isDialIn
      lastBreakoutRoom {
        sequence
        isUserCurrentlyInRoom
      }
    }
  }
`;
