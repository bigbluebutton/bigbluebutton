// Stands in for react-intl. The components under test only format two labels;
// returning the message id keeps assertions readable without an IntlProvider.
export const defineMessages = (messages) => messages;
export const useIntl = () => ({ formatMessage: (message) => message?.id ?? '' });
export const injectIntl = (Component) => Component;
