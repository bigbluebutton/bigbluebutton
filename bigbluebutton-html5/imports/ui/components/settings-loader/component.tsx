import React, { useContext, useEffect } from 'react';
import { setMeetingSettings } from '../../core/local-states/useMeetingSettings';
import MeetingClientSettings from '../../Types/meetingClientSettings';
import ClientStartup from '/client/clientStartup';
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
    loadingContextInfo.setLoading(true, '3/4');
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('sessionToken');
    const clientStartupSettings = `/api/rest/clientSettings/?sessionToken=${sessionToken}`;
    const url = new URL(`${window.location.origin}${clientStartupSettings}`);
    fetch(url, { method: 'get' })
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
    // }
  }, []);
  return (
    (allowToRender)
      ? (
        <CustomUsersSettings>
          <ClientStartup />
        </CustomUsersSettings>
      )
      : null
  );
};

export default SettingsLoader;
