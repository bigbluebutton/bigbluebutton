import React, { useEffect } from 'react';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import Screenshare from '/imports/api/screenshare';
import { useCreateUseSubscription } from '/imports/ui/core/hooks/createUseSubscription';
import { ScreenshareType, getScreenShareData } from './queries';

interface ScreenShareGraphQlMiniMongoAdapterProps {
  meetingId: string;
}

const ScreenShareGraphQlMiniMongoAdapter: React.FC<ScreenShareGraphQlMiniMongoAdapterProps> = ({
  meetingId,
}) => {
  const screenshareSubscription = useCreateUseSubscription<ScreenshareType>(getScreenShareData, {}, true);
  const {
    data: screenshareData,
  } = screenshareSubscription();

  useEffect(() => {
    if (screenshareData) {
      const screenshare = JSON.parse(JSON.stringify(screenshareData[0] || '{}'));
      const { screenshareId } = screenshare;
      Screenshare.upsert({ screenshareId }, {
        meetingId,
        screenshare: {
          ...screenshare,
        },
        screenshareId,
      });
    }
    return () => {
      Screenshare.remove({ meetingId });
    };
  }, [screenshareData]);
  return null;
};

const ScreenShareGraphQlMiniMongoAdapterContainer: React.FC = () => {
  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
    meetingId: m.meetingId,
  }));
  const hasCurrentscreenshare = currentMeeting?.componentsFlags?.hasScreenshare ?? false;
  return hasCurrentscreenshare ? (
    <ScreenShareGraphQlMiniMongoAdapter
      meetingId={currentMeeting?.meetingId ?? ''}
    />
  ) : null;
};

export default ScreenShareGraphQlMiniMongoAdapterContainer;
