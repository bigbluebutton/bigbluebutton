import React from 'react';
import ConnectionManager from '/imports/ui/components/connection-manager/component';
// eslint-disable-next-line react/no-deprecated
import { render } from 'react-dom';
import SettingsLoader from '/imports/ui/components/settings-loader/component';
import ErrorBoundary from '/imports/ui/components/common/error-boundary/component';
import { ErrorScreen } from '/imports/ui/components/error-screen/component';
import PresenceManager from '/imports/ui/components/join-handler/presenceManager/component';
import LoadingScreenHOC from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';
import IntlLoaderContainer from '/imports/startup/client/intlLoader';
import LocatedErrorBoundary from '/imports/ui/components/common/error-boundary/located-error-boundary/component';
import StartupDataFetch from '/imports/ui/components/connection-manager/startup-data-fetch/component';

import GraphqlToMiniMongoAdapterManager from '/imports/ui/components/components-data/graphqlToMiniMongoAdapterManager/component';

const STARTUP_CRASH_METADATA = { logCode: 'app_startup_crash', logMessage: 'Possible startup crash' };
const APP_CRASH_METADATA = { logCode: 'app_crash', logMessage: 'Possible app crash' };

const Main: React.FC = () => {
  // Meteor.disconnect();
  return (
    <StartupDataFetch>
      <ErrorBoundary Fallback={ErrorScreen} logMetadata={STARTUP_CRASH_METADATA}>
        <LoadingScreenHOC>
          <IntlLoaderContainer>
            {/* from there the error messages are located */}
            <LocatedErrorBoundary Fallback={ErrorScreen} logMetadata={APP_CRASH_METADATA}>
              <ConnectionManager>
                <PresenceManager>
                  <GraphqlToMiniMongoAdapterManager>
                    <SettingsLoader />
                  </GraphqlToMiniMongoAdapterManager>
                </PresenceManager>
              </ConnectionManager>
            </LocatedErrorBoundary>
          </IntlLoaderContainer>
        </LoadingScreenHOC>
      </ErrorBoundary>
    </StartupDataFetch>
  );
};

render(
  <Main />,
  document.getElementById('app'),
);
