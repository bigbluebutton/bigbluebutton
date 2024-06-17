import React, { useContext, useEffect } from 'react';
import { setMeetingSettings } from '../../core/local-states/useMeetingSettings';
import MeetingClientSettings from '../../Types/meetingClientSettings';
import MeetingClient from '/client/meetingClient';
import { LoadingContext } from '../common/loading-screen/loading-screen-HOC/component';
import CustomUsersSettings from '../join-handler/custom-users-settings/component';
import logger from '/imports/startup/client/logger';

interface Response {
  meeting_clientSettings: Array<{
    clientSettingsJson: MeetingClientSettings,
  }>
}

declare global {
  interface Window {
    meetingClientSettings: MeetingClientSettings;
  }
}

const SettingsLoader: React.FC = () => {
  const [allowToRender, setAllowToRender] = React.useState(false);
  const loadingContextInfo = useContext(LoadingContext);
  useEffect(() => {
    logger.info('Fetching settings');
    loadingContextInfo.setLoading(true, '4/5');
  }, []);

  useEffect(() => {
    const pathMatch = window.location.pathname.match('^(.*)/html5client/join$');
    if (pathMatch == null) {
      throw new Error('Failed to match BBB client URI');
    }
    const serverPathPrefix = pathMatch[1];
    fetch(`https://${window.location.hostname}${serverPathPrefix}/bigbluebutton/api`, {
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((resp) => resp.json())
      .then((data) => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionToken = urlParams.get('sessionToken');
        const clientStartupSettings = `/clientSettings/?sessionToken=${sessionToken}`;
        const url = new URL(`${data.response.graphqlApiUrl}${clientStartupSettings}`);
        fetch(url, { method: 'get', credentials: 'include' })
          .then((resp) => resp.json())
          .then((data: Response) => {
            const settings = data?.meeting_clientSettings[0].clientSettingsJson;

            window.meetingClientSettings = JSON.parse(JSON.stringify(settings as unknown as MeetingClientSettings));
            const Meteor = { settings: {} };
            Meteor.settings = window.meetingClientSettings;
            setMeetingSettings(settings as unknown as MeetingClientSettings);
            setAllowToRender(true);
          }).catch(() => {
            loadingContextInfo.setLoading(false, '');
            throw new Error('Error on requesting client settings data.');
          });
      }).catch((error) => {
        loadingContextInfo.setLoading(false, '');
        throw new Error('Error fetching GraphQL API URL: '.concat(error.message || ''));
      });
  }, []);
  return (
    (allowToRender)
      ? (
        <CustomUsersSettings>
          <MeetingClient />
        </CustomUsersSettings>
      )
      : null
  );
};

export default SettingsLoader;
