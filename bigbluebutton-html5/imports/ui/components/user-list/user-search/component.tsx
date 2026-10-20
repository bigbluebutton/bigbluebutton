import React from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { BBBSearch } from '@bigbluebutton/bbb-ui-components-react';
import Styled from './styles';

const intlMessages = defineMessages({
  searchUsers: {
    id: 'app.userList.searchUsers',
    description: 'Placeholder text for user search input',
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

  return (
    <Styled.SearchWrapper className="bbb-user-list__search">
      <BBBSearch
        placeholder={intl.formatMessage(intlMessages.searchUsers)}
        aria-label={intl.formatMessage(intlMessages.searchUsers)}
        onSearch={onSearchChange}
        debounce={debounceDelayMs}
        isLoading={isQueryLoading}
        autoFocus
      />
    </Styled.SearchWrapper>
  );
};

export default UserSearch;
