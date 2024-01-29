import React, { Suspense, useContext, useEffect, useMemo } from 'react';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
import { LoadingContext } from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';
const MeetingClientLazy = React.lazy(() => import('./meetingClient'));

const ClientStartup: React.FC = () => {
  const loadingContextInfo = useContext(LoadingContext);
  useEffect(() => {
    loadingContextInfo.setLoading(true, 'Loading Client');
  }, []);

  return (
    <Suspense>
      {
        (() => {
          try {
            return <MeetingClientLazy />;
          } catch (error) {
            throw new Error('Error on rendering MeetingClientLazy: '.concat(JSON.stringify(error) || ''));
          }
        })()
      }
    </Suspense>
  );
};

export default ClientStartup;
