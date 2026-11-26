declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'em-emoji': EmojiProps;
    }
  }
}
export interface EmojiProps {
  emoji: { native: string; };
  native: string;
  size: number;
}

/**
 * Only the fields the avatar content reads, so any list that shows a participant can reuse it
 * without carrying the whole user around.
 */
export interface AvatarContentUser {
  name: string;
  avatar: string;
  isDialIn: boolean;
  away: boolean;
  reactionEmoji: string;
  lastBreakoutRoom?: { sequence: number; isUserCurrentlyInRoom: boolean } | null;
}

export interface AvatarContentProps {
  user: AvatarContentUser,
}
