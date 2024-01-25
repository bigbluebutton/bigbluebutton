import React, { Suspense, useMemo } from 'react';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
const MeetingClientLazy = React.lazy(() => import('./meetingClient'));

const ClientStartup: React.FC = () => {
  const loadingScreen = useMemo(() => {
    return (
      <LoadingScreen>
        {/* I made this because the component is in JS and requires a child, but it's optional */}
        <div style={{
          display: 'none',
        }}
        >
          <h1>Loading...</h1>
        </div>
      </LoadingScreen>
    );
  }, []);
  return (
    <Suspense fallback={loadingScreen}>
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
