import React from 'react';
import ConnectionManager from '/imports/ui/components/connection-manager/component';
import { createRoot } from 'react-dom/client';
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
/* eslint-disable */
if (
  process.env.NODE_ENV === 'production'
  //  @ts-ignore
  && window.__REACT_DEVTOOLS_GLOBAL_HOOK__
) {
  //  @ts-ignore
  for (const prop in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    if (prop === 'renderers') {
      //  @ts-ignore
      // prevents console error when dev tools try to iterate of renderers
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] = new Map();
      continue;
    }
    //  @ts-ignore
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] = typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] === 'function'
      ? Function.prototype
      : null;
  }
}
/* eslint-enable */

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

const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<Main />);
