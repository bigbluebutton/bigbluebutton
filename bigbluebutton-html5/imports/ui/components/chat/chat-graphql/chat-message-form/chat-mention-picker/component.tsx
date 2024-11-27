import React, {
  useCallback, useImperativeHandle, useState,
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

const PAGE_SIZE = 5;
const KEYS = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
  ENTER: 'Enter',
  ESC: 'Escape',
};

const ChatMentionPicker = React.forwardRef<ChatMentionPickerRef, ChatMentionPickerProps>((props, ref) => {
  const { input, onSelect, onClose } = props;
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { data: userBasicInfoData, fetchMore } = useQuery<UserBasicInfoQueryResponse>(USER_BASIC_INFO, {
    variables: {
      offset: 0,
      limit: PAGE_SIZE,
      name: `%${input}%`,
    },
    fetchPolicy: 'no-cache',
  });

  const users = userBasicInfoData?.user ?? [];
  const userCount = userBasicInfoData?.user_aggregate.aggregate.count ?? 0;

  const fetchMoreUsers = useCallback((offset: number, limit: number) => {
    if (userCount === users.length) return Promise.resolve();
    return fetchMore({
      variables: { offset, limit },
      updateQuery(previousQueryResult, { fetchMoreResult, variables: { offset } }) {
        const updatedUser = previousQueryResult.user.slice(0);
        for (let i = 0; i < fetchMoreResult.user.length; i += 1) {
          updatedUser[offset + i] = fetchMoreResult.user[i];
        }
        return { ...previousQueryResult, user: updatedUser };
      },
    });
  }, [fetchMore, userCount, users.length]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (e.target instanceof HTMLDivElement) {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (Math.ceil(scrollTop) >= scrollHeight - clientHeight) {
        fetchMoreUsers(users.length, PAGE_SIZE);
      }
    }
  }, [userCount, users.length, fetchMoreUsers]);

  useImperativeHandle(ref, () => ({
    dispatchInputKeyDownEvent(event) {
      switch (event.key) {
        case KEYS.ARROW_DOWN: {
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev + 1;
            if (next > userCount - 1) {
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
              fetchMoreUsers(users.length, userCount - users.length);
              return userCount - 1;
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
  }), [userCount, users, focusedIndex]);

  if (!userCount) {
    return null;
  }

  return (
    <ClickOutside onClick={onClose}>
      <Styled.Root>
        <Styled.Container onScroll={handleScroll}>
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
