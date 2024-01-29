import React from 'react';
import ConnectionManager from '/imports/ui/components/connection-manager/component';
// eslint-disable-next-line react/no-deprecated
import { render } from 'react-dom';
import SettingsLoader from '/imports/ui/components/settings-loader/component';
import ErrorBoundary from '/imports/ui/components/common/error-boundary/component';
import { ErrorScreen } from '/imports/ui/components/error-screen/component';
import LoadingScreenHOC from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';

const Main: React.FC = () => {
  return (
    <ErrorBoundary Fallback={ErrorScreen}>
      <LoadingScreenHOC>
        <ConnectionManager>
          <SettingsLoader />
        </ConnectionManager>
      </LoadingScreenHOC>
    </ErrorBoundary>
  );
};

render(
  <Main />,
  document.getElementById('app'),
);
