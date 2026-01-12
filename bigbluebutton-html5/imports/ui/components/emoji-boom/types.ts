export interface ReactionItem {
  createdAt: string;
  reactionEmoji: string;
  userId: string;
  user: {
    color: string;
    nameSortable: string;
    isModerator: boolean;
  };
}

export interface EmojiBoomStream {
  user_reaction_stream: ReactionItem[];
}

export interface Point {
  x: number;
  y: number;
}

export interface ConfettiEmoji {
  element: HTMLDivElement;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  scale: number;
  opacity: number;
}

export interface AvatarBubble {
  element: HTMLDivElement;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}
