import React, { useEffect, useRef } from 'react';
import browserInfo from '/imports/utils/browserInfo';
import Styled from './styles';

interface ChatMentionPickerItemProps {
  focused: boolean;
  onSelect: (user: { userId: string; name: string }) => void;
  user: {
    userId: string;
    name: string;
    color: string;
    avatar: string;
    isModerator: boolean;
    presenter: boolean;
  };
}

const { isChrome, isFirefox, isEdge } = browserInfo;

const ChatMentionPickerItem: React.FC<ChatMentionPickerItemProps> = (props) => {
  const {
    onSelect, user, focused,
  } = props;

  const itemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (focused) {
      itemRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [focused]);

  return (
    <Styled.ListItem
      key={user.userId}
      ref={itemRef}
    >
      <Styled.Button
        $focused={focused}
        type="button"
        onClick={() => {
          onSelect(user);
        }}
      >
        <Styled.Avatar
          moderator={user.isModerator}
          presenter={user.presenter}
          color={user.color}
          avatar={user.avatar}
          isChrome={isChrome}
          isFirefox={isFirefox}
          isEdge={isEdge}
        >
          {user.avatar.length === 0 ? user.name.toLowerCase().slice(0, 2) : null}
        </Styled.Avatar>
        <Styled.Username>
          {user.name}
        </Styled.Username>
      </Styled.Button>
    </Styled.ListItem>
  );
};

export default ChatMentionPickerItem;
