import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import meetingClientSettingsInitialValues from '/imports/ui/core/initial-values/meetingClientSettings';
import { makeUserSearchWhere } from '/imports/ui/components/user-list/service';
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
  filterHint: {
    id: 'app.chat.mention.filterHint',
    description: 'Mention picker hint shown before the user types a name',
  },
});

export const MENTION_PICKER_ID = 'chat-mention-picker';

const MENTIONS_FALLBACK = meetingClientSettingsInitialValues.public.chat.mentions;

const optionId = (userId: string) => `chat-mention-option-${userId}`;

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
  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const MENTION_PICKER_LIMIT = CHAT_CONFIG.mentions?.pickerLimit ?? MENTIONS_FALLBACK.pickerLimit;
  const MENTION_PICKER_DEBOUNCE_MS = CHAT_CONFIG.mentions?.pickerDebounceMs ?? MENTIONS_FALLBACK.pickerDebounceMs;

  const [debouncedSearch, setDebouncedSearch] = useState(searchText);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchText), MENTION_PICKER_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchText, MENTION_PICKER_DEBOUNCE_MS]);

  const where = useMemo(() => ({
    _and: [
      makeUserSearchWhere(debouncedSearch),
      { bot: { _eq: false } },
      { loggedOut: { _eq: false } },
      { userId: { _neq: Auth.userID } },
    ],
  }), [debouncedSearch]);

  const hasSearchTerm = debouncedSearch.trim() !== '';

  const { data, loading } = useDeduplicatedSubscription<GetMentionUsersResponse>(
    GET_MENTION_USERS,
    { variables: { where, limit: MENTION_PICKER_LIMIT } },
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const users = useMemo<MentionUser[]>(() => data?.user ?? [], [data?.user]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedSearch]);

  useEffect(() => {
    setActiveIndex((prev) => (prev >= users.length ? 0 : prev));
  }, [users.length]);

  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const usersRef = useRef(users);
  const activeIndexRef = useRef(activeIndex);
  const onSelectRef = useRef(onSelect);
  const onCloseRef = useRef(onClose);
  usersRef.current = users;
  activeIndexRef.current = activeIndex;
  onSelectRef.current = onSelect;
  onCloseRef.current = onClose;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(1, usersRef.current.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(
          (prev) => (prev - 1 + Math.max(1, usersRef.current.length)) % Math.max(1, usersRef.current.length),
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const current = usersRef.current[activeIndexRef.current];
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

  const activeUser = users[activeIndex];

  return (
    <Styled.PickerContainer id={MENTION_PICKER_ID} data-test="chatMentionPicker">
      <Styled.PickerHeader>
        {intl.formatMessage(intlMessages.title)}
      </Styled.PickerHeader>
      <Styled.ScreenReaderStatus aria-live="polite">
        {activeUser?.name ?? ''}
      </Styled.ScreenReaderStatus>
      {users.length === 0 ? (
        !loading && (
          <Styled.EmptyState data-test="chatMentionNoResults">
            {intl.formatMessage(intlMessages.noResults)}
          </Styled.EmptyState>
        )
      ) : (
        <Styled.UserList
          ref={listRef}
          role="listbox"
          aria-label={intl.formatMessage(intlMessages.title)}
          aria-activedescendant={activeUser ? optionId(activeUser.userId) : undefined}
        >
          {users.map((user, index) => (
            <Styled.UserItem
              key={user.userId}
              id={optionId(user.userId)}
              $active={index === activeIndex}
              role="option"
              aria-selected={index === activeIndex}
              data-test="chatMentionOption"
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
      {!hasSearchTerm && users.length > 0 && (
        <Styled.PickerHint data-test="chatMentionFilterHint">
          {intl.formatMessage(intlMessages.filterHint)}
        </Styled.PickerHint>
      )}
    </Styled.PickerContainer>
  );
};

export default ChatMentionPicker;
