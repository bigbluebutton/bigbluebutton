import React, { Fragment } from 'react';
import LoadingScreen from '/imports/ui/components/loading-screen/component';
import ErrorScreen from '/imports/ui/components/error-screen/component';
import { withJoinLoadingContext } from './context/context';
import IntlProvider from '/imports/startup/client/intl';
import Settings from '/imports/ui/services/settings';

const JoinLoadComponent = (props) => {
  const { children, showLoading, hasError } = props;
  const { locale } = Settings.application;
  return (
    <Fragment>
      {(showLoading && !hasError) && (<LoadingScreen />)}
      {hasError && (
      <IntlProvider locale={locale}>
        <ErrorScreen />
      </IntlProvider>
      )}
      { !hasError && children}
    </Fragment>
  );
};

export default withJoinLoadingContext(JoinLoadComponent);
