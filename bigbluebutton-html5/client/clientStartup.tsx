import React, {
  Suspense,
  useContext,
  useEffect,
} from 'react';
import { LoadingContext } from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';
import { defineMessages, useIntl } from 'react-intl';

const MeetingClientLazy = React.lazy(() => import('./meetingClient'));

const intlMessages = defineMessages({
  loadingClientLabel: {
    id: 'app.meeting.loadingClient',
    description: 'loading client label',
  },
});

const ClientStartup: React.FC = () => {
  const loadingContextInfo = useContext(LoadingContext);
  const intl = useIntl();
  useEffect(() => {
    loadingContextInfo.setLoading(true, intl.formatMessage(intlMessages.loadingClientLabel));
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
