import { useCallback, useRef } from 'react';
import { useMutation } from '@apollo/client';
import useMeeting from './useMeeting';
import { isSharing, screenshareHasEnded } from '/imports/ui/components/screenshare/service';
import { EXTERNAL_VIDEO_STOP } from '/imports/ui/components/external-video-player/mutations';
import { PIN_NOTES } from '/imports/ui/components/notes/mutations';

export type PresentationAreaContent = 'screenshare' | 'externalVideo' | 'pinnedNotes' | 'pluginContent';

// Returns a function that stops whatever else occupies the presentation area
// when `starting` takes it over. Callers are expected to be the presenter.
const useEjectPresentationAreaContent = () => {
  const { data: currentMeeting } = useMeeting((m) => ({ componentsFlags: m.componentsFlags }));
  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);
  const [pinSharedNotes] = useMutation(PIN_NOTES);
  // Read through a ref so callers that eject asynchronously (e.g. after the
  // screen picker resolves) see the current flags, not the ones at call time
  const componentsFlags = useRef(currentMeeting?.componentsFlags);
  componentsFlags.current = currentMeeting?.componentsFlags;

  return useCallback((starting: PresentationAreaContent) => {
    const { hasExternalVideo, isSharedNotesPinned } = componentsFlags.current || {};
    if (starting !== 'screenshare' && isSharing()) screenshareHasEnded();
    if (starting !== 'externalVideo' && hasExternalVideo) stopExternalVideoShare();
    if (starting !== 'pinnedNotes' && isSharedNotesPinned) pinSharedNotes({ variables: { pinned: false } });
  }, [stopExternalVideoShare, pinSharedNotes]);
};

export default useEjectPresentationAreaContent;
