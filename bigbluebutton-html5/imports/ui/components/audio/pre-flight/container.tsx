import React from 'react';
import getFromUserSettings from '/imports/ui/services/users-settings';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useLockContext from '/imports/ui/components/lock-viewers/hooks/useLockContext';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import Service from '/imports/ui/components/audio/service';
import PreFlight from './component';

interface PreFlightContainerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  priority: string;
  onJoined: () => void;
}

const PreFlightContainer: React.FC<PreFlightContainerProps> = ({
  isOpen,
  setIsOpen,
  priority,
  onJoined,
}) => {
  const { data: meeting } = useMeeting((m) => ({
    voiceSettings: { muteOnStart: m?.voiceSettings?.muteOnStart },
    audioBridge: m.audioBridge,
  }));
  const { data: currentUser } = useCurrentUser((u) => ({ isModerator: u.isModerator }));
  const { userLocks } = useLockContext();

  const APP_CONFIG = window.meetingClientSettings.public.app;
  const KURENTO_CONFIG = window.meetingClientSettings.public.kurento;
  const { enabled: localEchoEnabled } = window.meetingClientSettings.public.media.localEchoTest;

  const usingLiveKit = meeting?.audioBridge === 'livekit';
  const forceListenOnly = getFromUserSettings('bbb_force_listen_only', APP_CONFIG.forceListenOnly);
  const listenOnlyMode = forceListenOnly
    || (getFromUserSettings('bbb_listen_only_mode', APP_CONFIG.listenOnlyMode) && !usingLiveKit);
  const enableVideo = getFromUserSettings('bbb_enable_video', KURENTO_CONFIG.enableVideo);
  const autoShareWebcam = getFromUserSettings('bbb_auto_share_webcam', KURENTO_CONFIG.autoShareWebcam);

  const forceListenOnlyAttendee = forceListenOnly && !currentUser?.isModerator;
  const micDisabled = !!forceListenOnlyAttendee || !!userLocks.userMic;

  const storageMuteState = useStorageKey(Service.getStorageMuteStateKey(), 'session');
  const muted = storageMuteState ?? meeting?.voiceSettings?.muteOnStart ?? false;

  return (
    <PreFlight
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      priority={priority}
      onJoined={onJoined}
      muted={!!muted}
      localEchoEnabled={!!localEchoEnabled}
      listenOnlyMode={!!listenOnlyMode}
      micDisabled={micDisabled}
      enableVideo={!!enableVideo}
      autoShareWebcam={!!autoShareWebcam}
    />
  );
};

export default PreFlightContainer;
