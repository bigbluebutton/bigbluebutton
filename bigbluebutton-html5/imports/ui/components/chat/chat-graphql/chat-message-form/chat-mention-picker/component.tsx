import React, {
  useCallback, useImperativeHandle, useMemo, useState,
} from 'react';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { BASIC_USER_INFO, BasicUserInfoSubscriptionResponse } from '/imports/ui/components/chat/chat-graphql/chat-message-list/queries';
import ChatMentionPickerItem from './item/component';
import Styled from './styles';

interface ChatMentionPickerProps {
  input: string;
  onSelect: (user: { userId: string; name: string }) => void;
  onClose(): void;
}

export interface ChatMentionPickerRef {
  dispatchInputKeyDownEvent(event: React.KeyboardEvent<HTMLTextAreaElement>): void;
}

const PAGE_SIZE = 5;
const KEYS = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
  ENTER: 'Enter',
  ESC: 'Escape',
};

const ChatMentionPicker = React.forwardRef<ChatMentionPickerRef, ChatMentionPickerProps>((props, ref) => {
  const { input, onSelect, onClose } = props;
  const [numberOfItems, setNumberOfItems] = useState(PAGE_SIZE);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const { data: userInfoData } = useDeduplicatedSubscription<BasicUserInfoSubscriptionResponse>(BASIC_USER_INFO);
  const filteredUsers = useMemo(() => {
    return userInfoData?.user.filter((user) => user.name.includes(input)) ?? [];
  }, [input, userInfoData]);
  const count = filteredUsers.length;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (e.target instanceof HTMLDivElement) {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (Math.ceil(scrollTop) >= scrollHeight - clientHeight) {
        setNumberOfItems((prev) => Math.min(prev + PAGE_SIZE, count));
      }
    }
  }, [count]);

  useImperativeHandle(ref, () => ({
    dispatchInputKeyDownEvent(event) {
      switch (event.key) {
        case KEYS.ARROW_DOWN: {
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev + 1;
            if (next > count - 1) {
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
              setNumberOfItems(count);
              return count - 1;
            }
            return next;
          });
          break;
        }
        case KEYS.ENTER: {
          event.preventDefault();
          onSelect(filteredUsers[focusedIndex]);
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
  }), [count, filteredUsers, focusedIndex]);

  return (
    <Styled.Root>
      <Styled.Container onScroll={handleScroll}>
        <Styled.List>
          {filteredUsers.slice(0, numberOfItems).map((user, index) => (
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
  );
});

export default ChatMentionPicker;
