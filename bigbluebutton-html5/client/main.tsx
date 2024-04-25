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
import UserGrapQlMiniMongoAdapter from '/imports/ui/components/components-data/userGrapQlMiniMongoAdapter/component';
import VoiceUserGrapQlMiniMongoAdapter from '/imports/ui/components/components-data/voiceUserGraphQlMiniMongoAdapter/component';
import MeetingGrapQlMiniMongoAdapter from '/imports/ui/components/components-data/meetingGrapQlMiniMongoAdapter/component';
import ScreenShareGraphQlMiniMongoAdapterContainer from '/imports/ui/components/components-data/screenshareGraphQlMiniMongoAdapter/component';
import VideoStreamAdapter from '/imports/ui/components/video-provider/video-provider-graphql/adapter';

const Main: React.FC = () => {
  // Meteor.disconnect();
  return (
    <StartupDataFetch>
      <ErrorBoundary Fallback={ErrorScreen}>
        <LoadingScreenHOC>
          <IntlLoaderContainer>
            {/* from there the error messages are located */}
            <LocatedErrorBoundary Fallback={ErrorScreen}>
              <ConnectionManager>
                <PresenceManager>
                  <SettingsLoader />
                  <UserGrapQlMiniMongoAdapter />
                  <VoiceUserGrapQlMiniMongoAdapter />
                  <MeetingGrapQlMiniMongoAdapter />
                  <ScreenShareGraphQlMiniMongoAdapterContainer />
                  <VideoStreamAdapter />
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
