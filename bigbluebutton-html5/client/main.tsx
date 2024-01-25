import React from 'react';
import ConnectionManager from '/imports/ui/components/connection-manager/component';
// eslint-disable-next-line react/no-deprecated
import { render } from 'react-dom';
import SettingsLoader from '/imports/ui/components/settings-loader/component';
import ErrorBoundary from '/imports/ui/components/common/error-boundary/component';
import { ErrorScreen } from '/imports/ui/components/error-screen/component';

const Main: React.FC = () => {
  return (
    <ErrorBoundary Fallback={ErrorScreen}>
      <ConnectionManager>
        <SettingsLoader />
      </ConnectionManager>
    </ErrorBoundary>
  );
};

render(
  <Main />,
  document.getElementById('app'),
);
