import React from 'react';
import ConnectionManager from '/imports/ui/components/connection-manager/component';
import { createRoot } from 'react-dom/client';
import SettingsLoader from '/imports/ui/components/settings-loader/component';
import ErrorBoundary from '/imports/ui/components/common/error-boundary/component';
import ErrorScreen from '/imports/ui/components/error-screen/component';
import PresenceManager from '/imports/ui/components/join-handler/presenceManager/component';
import LoadingScreenHOC from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';
import IntlLoaderContainer from '/imports/startup/client/intlLoader';
import CustomUsersSettings from '/imports/ui/components/join-handler/custom-users-settings/component';
import MeetingClient from '/client/meetingClient';
import CustomStyles from '/imports/ui/components/custom-styles/component';
import 'react-toastify/dist/ReactToastify.css';

const STARTUP_CRASH_METADATA = { logCode: 'app_startup_crash', logMessage: 'Possible startup crash' };
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
      <CustomUsersSettings>
        <IntlLoaderContainer>
          <CustomStyles>
            <ErrorBoundary
              Fallback={ErrorScreen}
              logMetadata={STARTUP_CRASH_METADATA}
              isCritical
              captureGlobalLogs
            >
              <LoadingScreenHOC>
                <ConnectionManager>
                  <PresenceManager>
                    <MeetingClient />
                  </PresenceManager>
                </ConnectionManager>
              </LoadingScreenHOC>
            </ErrorBoundary>
          </CustomStyles>
        </IntlLoaderContainer>
      </CustomUsersSettings>
    </SettingsLoader>
  );
};

const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<Main />);
