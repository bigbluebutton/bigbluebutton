import { Attributes } from 'react';
import { User } from '/imports/ui/Types/user';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'em-emoji': EmEmojiAttributes;
    }
  }
}

export interface EmEmojiAttributes extends Attributes {
  emoji?: { id?: string; native?: string; };
  native?: string;
  size?: number;
  padding?: string;
}

export interface EmojiProps {
  emoji: { native: string; };
  native: string;
  size: number;
}

export interface AvatarContentProps {
  user: User,
}
