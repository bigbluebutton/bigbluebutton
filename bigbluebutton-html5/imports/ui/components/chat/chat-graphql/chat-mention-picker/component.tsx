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
import { getFilteredAvatar, makeUserSearchWhere } from '/imports/ui/components/user-list/service';
import AvatarContent from '/imports/ui/components/user-list/user-list-participants/list-item/avatar-content/component';
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
  optionLabel: {
    id: 'app.chat.mention.optionLabel',
    description: 'Mention picker accessible name for participants sharing a display name',
  },
});

export const MENTION_PICKER_ID = 'chat-mention-picker';

const MENTIONS_FALLBACK = meetingClientSettingsInitialValues.public.chat.mentions;

const optionId = (userId: string) => `chat-mention-option-${userId}`;

const nameKey = (name: string) => name.trim().toLowerCase();

/** Whatever the integration set as the external id, falling back to the internal one. */
const uniqueHandle = (user: MentionUser) => user.extId || user.userId;

interface ChatMentionPickerProps {
  searchText: string;
  /** The textarea the picker completes: it owns the key handling and the focus. */
  inputElement: HTMLTextAreaElement | null;
  /** The whole participant is handed over: the mention is anchored on the user id. */
  onSelect: (user: MentionUser) => void;
  /** Deliberate dismissal: the mention is settled and won't be offered again. */
  onClose: () => void;
  /** Out of the way, but the mention is still up for completion. */
  onDismiss: () => void;
  /** The focused element is the textarea, so it is the one that must announce it. */
  onActiveOptionChange: (activeOptionId: string | null) => void;
}

const ChatMentionPicker: React.FC<ChatMentionPickerProps> = ({
  searchText,
  inputElement,
  onSelect,
  onClose,
  onDismiss,
  onActiveOptionChange,
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

  // Which option is picked, and the result set it was picked in. Keeping the search alongside
  // the index is what lets the reset be worked out below instead of pushed through an effect.
  const [selection, setSelection] = useState({ search: debouncedSearch, index: 0 });
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const users = useMemo<MentionUser[]>(() => data?.user ?? [], [data?.user]);

  // Namesakes are the whole reason a mention can't be a display name. On screen the avatar
  // tells them apart, so an id the sender has no use for stays out of the way; a screen reader
  // has no avatar to go by, so there the unique handle is the only thing that separates them.
  const namesakeNames = useMemo(() => {
    const counts = new Map<string, number>();
    users.forEach((user) => {
      const key = nameKey(user.name);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return new Set(
      Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([key]) => key),
    );
  }, [users]);

  const isNamesake = (user: MentionUser) => namesakeNames.has(nameKey(user.name));

  // A fresh search, or a list that shrank past the picked option, falls back to the first one
  // in this same render: an effect would only get there after a second one.
  const activeIndex = selection.search === debouncedSearch && selection.index < users.length
    ? selection.index
    : 0;

  const selectIndex = (index: number) => setSelection({ search: debouncedSearch, index });

  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const activeUser = users[activeIndex];
  const activeOptionId = activeUser ? optionId(activeUser.userId) : null;

  const usersRef = useRef(users);
  const searchRef = useRef(debouncedSearch);
  const activeIndexRef = useRef(activeIndex);
  const onSelectRef = useRef(onSelect);
  const onCloseRef = useRef(onClose);
  const onDismissRef = useRef(onDismiss);
  const onActiveOptionChangeRef = useRef(onActiveOptionChange);
  usersRef.current = users;
  searchRef.current = debouncedSearch;
  activeIndexRef.current = activeIndex;
  onSelectRef.current = onSelect;
  onCloseRef.current = onClose;
  onDismissRef.current = onDismiss;
  onActiveOptionChangeRef.current = onActiveOptionChange;

  useEffect(() => {
    onActiveOptionChangeRef.current(activeOptionId);
  }, [activeOptionId]);

  useEffect(() => () => onActiveOptionChangeRef.current(null), []);

  useEffect(() => {
    if (!inputElement) return undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      // Nothing to pick: leave the keys to the message form so Enter still sends.
      const current = usersRef.current[activeIndexRef.current];
      if (usersRef.current.length === 0 || !current) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelection({
          search: searchRef.current,
          index: (activeIndexRef.current + 1) % usersRef.current.length,
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelection({
          search: searchRef.current,
          index: (activeIndexRef.current - 1 + usersRef.current.length) % usersRef.current.length,
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        onSelectRef.current(current);
      }
    };

    const handleBlur = () => onDismissRef.current();

    inputElement.addEventListener('keydown', handleKeyDown);
    inputElement.addEventListener('blur', handleBlur);
    return () => {
      inputElement.removeEventListener('keydown', handleKeyDown);
      inputElement.removeEventListener('blur', handleBlur);
    };
  }, [inputElement]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (inputElement?.contains(target)) return;
      onDismissRef.current();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputElement]);

  const optionLabel = (user: MentionUser) => (
    isNamesake(user)
      ? intl.formatMessage(intlMessages.optionLabel, { name: user.name, identifier: uniqueHandle(user) })
      : user.name
  );

  return (
    <Styled.PickerContainer ref={containerRef} id={MENTION_PICKER_ID} data-test="chatMentionPicker">
      <Styled.PickerHeader>
        {intl.formatMessage(intlMessages.title)}
      </Styled.PickerHeader>
      <Styled.ScreenReaderStatus aria-live="polite">
        {activeUser ? optionLabel(activeUser) : ''}
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
          aria-activedescendant={activeOptionId ?? undefined}
        >
          {users.map((user, index) => (
            <Styled.UserItem
              key={user.userId}
              id={optionId(user.userId)}
              $active={index === activeIndex}
              role="option"
              aria-selected={index === activeIndex}
              aria-label={optionLabel(user)}
              data-test="chatMentionOption"
              onMouseEnter={() => selectIndex(index)}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(user);
              }}
            >
              <Styled.MentionAvatar
                avatar={getFilteredAvatar(user)}
                color={user.color}
                moderator={user.isModerator}
              >
                {/* @ts-ignore */}
                <AvatarContent user={user} />
              </Styled.MentionAvatar>
              <Styled.UserName aria-hidden="true">{user.name}</Styled.UserName>
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
