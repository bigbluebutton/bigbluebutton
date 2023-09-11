import { useLazyQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { GET_SERVER_TIME, GetServerTimeResponse } from './queries';
import { setTimeSync } from '/imports/ui/core/local-states/useTimeSync';

const TimeSync: React.FC = () => {
  const [
    loadGetServerTime,
    {
      called,
      loading,
      data,
      error,
    },
  ] = useLazyQuery<GetServerTimeResponse>(GET_SERVER_TIME);
  useEffect(() => {
    if (!called) {
      loadGetServerTime();
    }
  }, []);

  if (error) {
    console.log('error', error);
    return (
      <div>
        {JSON.stringify(error)}
      </div>
    );
  }

  useEffect(() => {
    if (!loading && data) {
      const time = new Date(data.current_time[0].currentTimestamp);
      setTimeSync(time.getTime() - new Date().getTime());
    }
  }, [data, loading]);
  return null;
};

export default TimeSync;
