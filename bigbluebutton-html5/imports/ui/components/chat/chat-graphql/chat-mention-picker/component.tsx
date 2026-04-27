import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQuery } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import { GET_MENTION_USERS, GetMentionUsersResponse, MentionUser } from './queries';
import Styled from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.chat.mention.title',
    description: 'Mention picker header label',
  },
  noResults: {
    id: 'app.chat.mention.noResults',
    description: 'Mention picker empty state',
  },
});

const MAX_VISIBLE = 6;

interface ChatMentionPickerProps {
  searchText: string;
  onSelect: (name: string) => void;
  onClose: () => void;
}

const ChatMentionPicker: React.FC<ChatMentionPickerProps> = ({
  searchText,
  onSelect,
  onClose,
}) => {
  const intl = useIntl();
  const { data } = useQuery<GetMentionUsersResponse>(GET_MENTION_USERS, {
    fetchPolicy: 'cache-and-network',
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered: MentionUser[] = (data?.user ?? [])
    .filter((u) => u.userId !== Auth.userID)
    .filter((u) => u.name.toLowerCase().startsWith(searchText.toLowerCase()))
    .slice(0, MAX_VISIBLE);

  useEffect(() => {
    setActiveIndex(0);
  }, [searchText]);

  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (filtered[activeIndex]) {
          onSelect(filtered[activeIndex].name);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [filtered, activeIndex, onSelect, onClose]);

  return (
    <Styled.PickerContainer role="listbox" aria-label={intl.formatMessage(intlMessages.title)}>
      <Styled.PickerHeader>
        {intl.formatMessage(intlMessages.title)}
      </Styled.PickerHeader>
      {filtered.length === 0 ? (
        <Styled.EmptyState>
          {intl.formatMessage(intlMessages.noResults)}
        </Styled.EmptyState>
      ) : (
        <Styled.UserList ref={listRef}>
          {filtered.map((user, index) => (
            <Styled.UserItem
              key={user.userId}
              $active={index === activeIndex}
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(user.name);
              }}
            >
              <Styled.UserAvatar aria-hidden="true">
                {user.name.charAt(0)}
              </Styled.UserAvatar>
              <Styled.UserName>{user.name}</Styled.UserName>
            </Styled.UserItem>
          ))}
        </Styled.UserList>
      )}
    </Styled.PickerContainer>
  );
};

export default ChatMentionPicker;
