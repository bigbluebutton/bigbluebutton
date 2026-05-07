import React, { useState, useEffect, useCallback } from 'react';
import { CircularProgress } from '@mui/material';
import { useIntl, defineMessages } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';

const intlMessages = defineMessages({
  searchUsers: {
    id: 'app.userList.searchUsers',
    description: 'Placeholder text for user search input',
  },
  clearSearch: {
    id: 'app.userList.clearSearch',
    description: 'Label for clear search button',
  },
});

interface UserSearchProps {
  onSearchChange: (query: string) => void;
  debounceDelayMs?: number;
  isQueryLoading?: boolean;
}

const UserSearch: React.FC<UserSearchProps> = ({
  onSearchChange,
  debounceDelayMs = 500,
  isQueryLoading = false,
}) => {
  const intl = useIntl();
  const [internalValue, setInternalValue] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(internalValue);
    }, debounceDelayMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [internalValue, debounceDelayMs, onSearchChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    // clear action is immune to debounce
    setInternalValue('');
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <Styled.SearchContainer
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          inputRef.current?.focus();
        }
      }}
    >
      <Icon iconName="search" />
      <Styled.SearchInput
        ref={inputRef}
        type="text"
        placeholder={intl.formatMessage(intlMessages.searchUsers)}
        value={internalValue}
        onChange={handleChange}
        aria-label={intl.formatMessage(intlMessages.searchUsers)}
        autoFocus
      />
      {isQueryLoading && internalValue && (
        <Styled.SpinnerWrapper>
          <CircularProgress size={16} thickness={4} />
        </Styled.SpinnerWrapper>
      )}
      {!isQueryLoading && internalValue && (
        <Styled.ClearButton
          onClick={handleClear}
          aria-label={intl.formatMessage(intlMessages.clearSearch)}
          type="button"
        >
          ×
        </Styled.ClearButton>
      )}
    </Styled.SearchContainer>
  );
};

export default UserSearch;
