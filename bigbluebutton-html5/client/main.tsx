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
import CustomUsersSettings from '/imports/ui/components/join-handler/custom-users-settings/component';
import MeetingClient from '/client/meetingClient';

const STARTUP_CRASH_METADATA = { logCode: 'app_startup_crash', logMessage: 'Possible startup crash' };
const APP_CRASH_METADATA = { logCode: 'app_crash', logMessage: 'Possible app crash' };

const Main: React.FC = () => {
  return (
    <SettingsLoader>
      <ErrorBoundary Fallback={ErrorScreen} logMetadata={STARTUP_CRASH_METADATA}>
        <LoadingScreenHOC>
          <IntlLoaderContainer>
            {/* from there the error messages are located */}
            <LocatedErrorBoundary Fallback={ErrorScreen} logMetadata={APP_CRASH_METADATA}>
              <ConnectionManager>
                <PresenceManager>
                  <CustomUsersSettings>
                    <MeetingClient />
                  </CustomUsersSettings>
                </PresenceManager>
              </ConnectionManager>
            </LocatedErrorBoundary>
          </IntlLoaderContainer>
        </LoadingScreenHOC>
      </ErrorBoundary>
    </SettingsLoader>
  );
};

render(
  <Main />,
  document.getElementById('app'),
);
