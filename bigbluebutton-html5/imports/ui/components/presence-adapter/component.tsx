import React, { useEffect } from 'react';
import useAuthData from '/imports/ui/core/local-states/useAuthData';
import Auth from '/imports/ui/services/auth';
import Session from '/imports/ui/services/storage/in-memory';

interface PresenceAdapterProps {
    children: React.ReactNode;
}

const PresenceAdapter: React.FC<PresenceAdapterProps> = ({ children }) => {
  const [authData] = useAuthData();
  const [authSetted, setAuthSetted] = React.useState(false);
  useEffect(() => {
    const {
      authToken,
      logoutUrl,
      meetingId,
      sessionToken,
      userId,
      userName,
      extId,
      meetingName,
    } = authData;
    Auth.clearCredentials();
    Auth.set(
      meetingId,
      userId,
      authToken,
      logoutUrl,
      sessionToken,
      userName,
      extId,
      meetingName,
    );
    Auth.loggedIn = true;
    Session.setItem('userWillAuth', false);
    setAuthSetted(true);
  }, []);

  return authSetted ? children : null;
};

export default PresenceAdapter;
