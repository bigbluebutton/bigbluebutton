import React, {
  useImperativeHandle, useState,
} from 'react';
import { useQuery } from '@apollo/client';
import { USER_BASIC_INFO, UserBasicInfoQueryResponse } from '/imports/ui/components/chat/chat-graphql/chat-message-list/queries';
import ChatMentionPickerItem from './item/component';
import Styled from './styles';
import ClickOutside from '/imports/ui/components/click-outside/component';

interface ChatMentionPickerProps {
  input: string;
  onSelect: (user: { userId: string; name: string }) => void;
  onClose(): void;
}

export interface ChatMentionPickerRef {
  dispatchInputKeyDownEvent(event: React.KeyboardEvent<HTMLTextAreaElement>): void;
}

const PAGE_SIZE = 30;
const KEYS = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
  ENTER: 'Enter',
  ESC: 'Escape',
};

const ChatMentionPicker = React.forwardRef<ChatMentionPickerRef, ChatMentionPickerProps>((props, ref) => {
  const { input, onSelect, onClose } = props;
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { data: userBasicInfoData } = useQuery<UserBasicInfoQueryResponse>(USER_BASIC_INFO, {
    variables: {
      limit: PAGE_SIZE,
      name: `%${input}%`,
    },
    fetchPolicy: 'no-cache',
  });

  const users = userBasicInfoData?.user ?? [];

  useImperativeHandle(ref, () => ({
    dispatchInputKeyDownEvent(event) {
      switch (event.key) {
        case KEYS.ARROW_DOWN: {
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev + 1;
            if (next > users.length - 1) {
              return 0;
            }
            return next;
          });
          break;
        }
        case KEYS.ARROW_UP: {
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev - 1;
            if (next < 0) {
              return users.length - 1;
            }
            return next;
          });
          break;
        }
        case KEYS.ENTER: {
          event.preventDefault();
          onSelect(users[focusedIndex]);
          break;
        }
        case KEYS.ESC: {
          event.preventDefault();
          onClose();
          break;
        }
        default:
      }
    },
  }), [users, focusedIndex]);

  if (!users.length) {
    return null;
  }

  return (
    <ClickOutside onClick={onClose}>
      <Styled.Root>
        <Styled.Container>
          <Styled.List>
            {users.map((user, index) => (
              <ChatMentionPickerItem
                key={`page-${index + 1}`}
                onSelect={onSelect}
                user={user}
                focused={index === focusedIndex}
              />
            ))}
          </Styled.List>
        </Styled.Container>
      </Styled.Root>
    </ClickOutside>
  );
});

export default ChatMentionPicker;
