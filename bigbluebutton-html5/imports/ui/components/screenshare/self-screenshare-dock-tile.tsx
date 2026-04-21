import React, { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { attachLocalPreviewStream } from '/imports/ui/components/screenshare/service';

// Video element ID for the self-screenshare preview in the camera dock.
// Uses the same prefix as SCREENSHARE_MEDIA_ELEMENT_NAME so the service's
// querySelector fallback ('video[id^="screenshareVideo"]') can find it when
// no peer primary share occupies the main area element.
export const SELF_DOCK_VIDEO_ID = 'screenshareVideo-self-dock';

const SelfScreenshareDockTile: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const intl = useIntl();

  useEffect(() => {
    const el = videoRef.current;
    if (el) attachLocalPreviewStream(el);
  }, []);

  const label = intl.formatMessage({
    id: 'app.screenshare.presenterSharingLabel',
    defaultMessage: 'You are sharing',
  });

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#06172a',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      data-test="selfScreenshareDockTile"
    >
      <video
        id={SELF_DOCK_VIDEO_ID}
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
      <span
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#fff',
          fontSize: '11px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '2px 6px',
          borderRadius: '3px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default SelfScreenshareDockTile;
