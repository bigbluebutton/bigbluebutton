import React, {
  Suspense,
  useContext,
  useEffect,
} from 'react';
import { LoadingContext } from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';
import logger from '/imports/startup/client/logger';

const MeetingClientLazy = React.lazy(() => import('./meetingClient'));

const ClientStartup: React.FC = () => {
  const loadingContextInfo = useContext(LoadingContext);
  useEffect(() => {
    logger.info('Loading client');
    loadingContextInfo.setLoading(true, '4/4');
  }, []);

  return (
    <Suspense>
      {
        (() => {
          try {
            return <MeetingClientLazy />;
          } catch (error) {
            loadingContextInfo.setLoading(false, '');
            throw new Error('Error on rendering MeetingClientLazy: '.concat(JSON.stringify(error) || ''));
          }
        })()
      }
    </Suspense>
  );
};

export default ClientStartup;
