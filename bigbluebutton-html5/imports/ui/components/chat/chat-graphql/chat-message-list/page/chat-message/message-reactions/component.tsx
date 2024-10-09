import React from 'react';
import Styled from './styles';

interface ChatMessageReactionsProps {
  reactions: {
    id: string;
    native: string;
  }[];
}

const ChatMessageReactions: React.FC<ChatMessageReactionsProps> = (props) => {
  const { reactions } = props;

  return (
    <Styled.ReactionsWrapper>
      {reactions.map((emoji) => {
        return (
          <Styled.EmojiWrapper highlighted={false}>
            <em-emoji
              emoji={emoji}
              size={parseFloat(
                window.getComputedStyle(document.documentElement).fontSize,
              )}
              native={emoji.native}
            />
          </Styled.EmojiWrapper>
        );
      })}
    </Styled.ReactionsWrapper>
  );
};

export default ChatMessageReactions;
