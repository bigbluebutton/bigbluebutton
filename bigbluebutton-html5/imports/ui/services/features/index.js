import useMeeting from '../../core/hooks/useMeeting';

export function useDisabledFeatures() {
  const { data: meetingData } = useMeeting((m) => ({
    disabledFeatures: m.disabledFeatures,
  }));
  const disabledFeatures = meetingData?.disabledFeatures || [];
  return disabledFeatures;
}

export function useIsScreenSharingEnabled() {
  return useDisabledFeatures().indexOf('screenshare') === -1 && window.meetingClientSettings.public.kurento.enableScreensharing;
}

export function useIsLearningDashboardEnabled() {
  return useDisabledFeatures().indexOf('learningDashboard') === -1;
}

export function useIsPollingEnabled() {
  return useDisabledFeatures().indexOf('polls') === -1 && window.meetingClientSettings.public.poll.enabled;
}

export function useIsQuizEnabled() {
  return useDisabledFeatures().indexOf('quizzes') === -1 && window.meetingClientSettings.public.poll.quiz.enabled;
}

export function useIsPresentationEnabled() {
  return useDisabledFeatures().indexOf('presentation') === -1;
}

export function useIsExternalVideoEnabled() {
  return useDisabledFeatures().indexOf('externalVideos') === -1 && window.meetingClientSettings.public.externalVideoPlayer.enabled;
}

export function useIsChatEnabled() {
  return useDisabledFeatures().indexOf('chat') === -1 && window.meetingClientSettings.public.chat.enabled;
}

export function useIsSharedNotesEnabled() {
  return useDisabledFeatures().indexOf('sharedNotes') === -1 && window.meetingClientSettings.public.notes.enabled;
}

export function useIsLiveTranscriptionEnabled() {
  return useDisabledFeatures().indexOf('liveTranscription') === -1 && window.meetingClientSettings.public.app.audioCaptions.enabled;
}

export function useIsBreakoutRoomsEnabled() {
  return useDisabledFeatures().indexOf('breakoutRooms') === -1;
}

export function useIsLayoutsEnabled() {
  return useDisabledFeatures().indexOf('layouts') === -1;
}

export function useIsVirtualBackgroundsEnabled() {
  return useDisabledFeatures().indexOf('virtualBackgrounds') === -1 && window.meetingClientSettings.public.virtualBackgrounds.enabled;
}

export function useIsCustomVirtualBackgroundsEnabled() {
  return useDisabledFeatures().indexOf('customVirtualBackgrounds') === -1;
}

export function useIsDownloadPresentationWithAnnotationsEnabled() {
  return useDisabledFeatures().indexOf('downloadPresentationWithAnnotations') === -1 && window.meetingClientSettings.public.presentation.allowDownloadWithAnnotations;
}

export function useIsDownloadPresentationConvertedToPdfEnabled() {
  return useDisabledFeatures().indexOf('downloadPresentationConvertedToPdf') === -1;
}

export function useIsDownloadPresentationOriginalFileEnabled() {
  return useDisabledFeatures().indexOf('downloadPresentationOriginalFile') === -1 && window.meetingClientSettings.public.presentation.allowDownloadOriginal;
}

export function useIsSnapshotOfCurrentSlideEnabled() {
  return useDisabledFeatures().indexOf('snapshotOfCurrentSlide') === -1 && window.meetingClientSettings.public.presentation.allowSnapshotOfCurrentSlide;
}

export function useIsImportPresentationWithAnnotationsFromBreakoutRoomsEnabled() {
  return useDisabledFeatures().indexOf('importPresentationWithAnnotationsFromBreakoutRooms') === -1;
}

export function useIsImportSharedNotesFromBreakoutRoomsEnabled() {
  return useDisabledFeatures().indexOf('importSharedNotesFromBreakoutRooms') === -1;
}

export function useIsReactionsEnabled() {
  const USER_REACTIONS_ENABLED = window.meetingClientSettings.public.userReaction.enabled;

  return useDisabledFeatures().indexOf('reactions') === -1 && USER_REACTIONS_ENABLED;
}

export function useIsTimerFeatureEnabled() {
  return useDisabledFeatures().indexOf('timer') === -1 && window.meetingClientSettings.public.timer.enabled;
}

export function useIsCameraAsContentEnabled() {
  return (
    useDisabledFeatures().indexOf('cameraAsContent') === -1
    && window.meetingClientSettings.public.app.enableCameraAsContent
  );
}

export function useIsInfiniteWhiteboardEnabled() {
  return (
    useDisabledFeatures().indexOf('infiniteWhiteboard') === -1
    && window.meetingClientSettings.public.whiteboard.allowInfiniteWhiteboard
  );
}

export function useIsReplyChatMessageEnabled() {
  return (
    useDisabledFeatures().indexOf('replyChatMessage') === -1
    && window.meetingClientSettings.public.chat.toolbar.includes('reply')
  );
}

export function useIsDeleteChatMessageEnabled() {
  return (
    useDisabledFeatures().indexOf('deleteChatMessage') === -1
    && window.meetingClientSettings.public.chat.toolbar.includes('delete')
  );
}

export function useIsEditChatMessageEnabled() {
  return (
    useDisabledFeatures().indexOf('editChatMessage') === -1
    && window.meetingClientSettings.public.chat.toolbar.includes('edit')
  );
}

export function useIsChatMessageReactionsEnabled() {
  return (
    useDisabledFeatures().indexOf('chatMessageReactions') === -1
    && window.meetingClientSettings.public.chat.toolbar.includes('reactions')
  );
}

export function useIsPrivateChatEnabled() {
  return useDisabledFeatures().indexOf('privateChat') === -1;
}

export function useIsRaiseHandEnabled() {
  return useDisabledFeatures().indexOf('raiseHand') === -1;
}

export function useIsUserReactionsEnabled() {
  const REACTIONS_BUTTON_ENABLED = window.meetingClientSettings.public.app.reactionsButton.enabled;
  const USER_REACTIONS_ENABLED = window.meetingClientSettings.public.userReaction.enabled;
  return useDisabledFeatures().indexOf('userReactions') === -1
    && REACTIONS_BUTTON_ENABLED
    && USER_REACTIONS_ENABLED;
}

/**
 * This hook returns `true` if the chat input emoji picker is disabled. `false`, otherwise.
 * @returns {boolean}
 */
export function useIsEmojiPickerEnabled() {
  const EMOJI_PICKER_ENABLED = window.meetingClientSettings.public.chat.emojiPicker.enable;
  return useDisabledFeatures().indexOf('chatEmojiPicker') === -1
    && EMOJI_PICKER_ENABLED;
}
