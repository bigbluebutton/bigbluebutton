export const isUserListSearchEnabled = () => (
  window.meetingClientSettings.public.userList.searchBar.enabled
);

// A user name accepted by the join API can be up to 255 characters.
export const USER_SEARCH_MAX_LENGTH = 255;

export const makeUserSearchWhere = (searchQuery: string) => {
  // Lowercase only to deduplicate equivalent terms; _ilike performs case-insensitive matching.
  const searchTerms = searchQuery
    ? [...new Set(searchQuery.slice(0, USER_SEARCH_MAX_LENGTH).trim().toLowerCase().split(/\s+/))]
    : [];
  const escapeTerm = (term: string) => term.replace(/[\\%_]/g, '\\$&');
  return searchTerms.length > 0
    ? { _and: searchTerms.map((term) => ({ name: { _ilike: `%${escapeTerm(term)}%` } })) }
    : { name: { _ilike: '%' } };
};

export default isUserListSearchEnabled;
