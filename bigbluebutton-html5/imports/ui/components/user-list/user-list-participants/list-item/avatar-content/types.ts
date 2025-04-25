import { User } from '/imports/ui/Types/user';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'em-emoji': EmojiProps;
    }
  }
}
export interface EmojiProps {
  emoji: { id: string, native: string; };
  native: string;
  size: number;
}

export interface AvatarContentProps {
  user: User,
}
