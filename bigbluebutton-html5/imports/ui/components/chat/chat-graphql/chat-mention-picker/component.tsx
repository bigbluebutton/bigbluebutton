import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSubscription } from '@apollo/client';
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
  const { data } = useSubscription<GetMentionUsersResponse>(GET_MENTION_USERS);

  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo<MentionUser[]>(
    () => (data?.user ?? [])
      .filter((u) => u.userId !== Auth.userID && u.name.toLowerCase().startsWith(searchText.toLowerCase())),
    [data?.user, searchText],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [searchText]);

  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const filteredRef = useRef(filtered);
  const activeIndexRef = useRef(activeIndex);
  const onSelectRef = useRef(onSelect);
  const onCloseRef = useRef(onClose);
  filteredRef.current = filtered;
  activeIndexRef.current = activeIndex;
  onSelectRef.current = onSelect;
  onCloseRef.current = onClose;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(1, filteredRef.current.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(
          (prev) => (prev - 1 + Math.max(1, filteredRef.current.length)) % Math.max(1, filteredRef.current.length),
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const current = filteredRef.current[activeIndexRef.current];
        if (current) {
          onSelectRef.current(current.name);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

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
