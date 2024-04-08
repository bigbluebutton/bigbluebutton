import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ErrorBoundary from '../component';

const intlMessages = defineMessages({
  errorMessage: {
    id: 'app.presentationUploder.genericError',
    defaultMessage: 'Something went wrong',
  },
});

const LocatedErrorBoundary = ({ children, ...props }) => {
  const intl = useIntl();
  return (
    <ErrorBoundary
      {...props}
      errorMessage={intl.formatMessage(intlMessages.errorMessage)}
    >
      {children}
    </ErrorBoundary>
  );
};

export default LocatedErrorBoundary;
