import React, { Suspense } from 'react';

const MeetingClientLazy = React.lazy(() => import('./meetingClient'));

const ClientStartup: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
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
