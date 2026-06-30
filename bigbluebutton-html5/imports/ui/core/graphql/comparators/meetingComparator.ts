import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { Meeting } from '../../../Types/meeting';
import { precompareResponses } from '../../hooks/useStableResponse';

export const meetingComparator = <T>(
  a: GraphqlDataHookSubscriptionResponse<T> | null,
  b: GraphqlDataHookSubscriptionResponse<T>,
) => {
  const pre = precompareResponses<Partial<Meeting>>(
    a as unknown as GraphqlDataHookSubscriptionResponse<Partial<Meeting>> | null,
    b as unknown as GraphqlDataHookSubscriptionResponse<Partial<Meeting>>,
  );
  if (pre === true) return true;
  if (pre === false) return false;
  const { aData: aRaw, bData: bRaw } = pre;
  const aData = aRaw as Partial<Meeting> | undefined;
  const bData = bRaw as Partial<Meeting> | undefined;
  if (!aData && !bData) return true;
  if (!aData || !bData) return false;

  // Meeting Subscription Properties (live data)
  if ((aData.createdTime ?? 0) !== (bData.createdTime ?? 0)) return false;
  const adf = aData.disabledFeatures;
  const bdf = bData.disabledFeatures;
  if (adf !== bdf) {
    if (!adf || !bdf) return false;
    if (adf.length !== bdf.length) return false;
    if (!adf.every((feature) => bdf.includes(feature))) return false;
  }
  if ((aData.durationInSeconds ?? 0) !== (bData.durationInSeconds ?? 0)) return false;
  if ((aData.extId ?? '') !== (bData.extId ?? '')) return false;
  if ((aData.isBreakout ?? false) !== (bData.isBreakout ?? false)) return false;
  if ((aData.learningDashboardAccessToken ?? '') !== (bData.learningDashboardAccessToken ?? '')) return false;
  if ((aData.maxPinnedCameras ?? 0) !== (bData.maxPinnedCameras ?? 0)) return false;
  if ((aData.meetingCameraCap ?? 0) !== (bData.meetingCameraCap ?? 0)) return false;
  if ((aData.cameraBridge ?? '') !== (bData.cameraBridge ?? '')) return false;
  if ((aData.screenShareBridge ?? '') !== (bData.screenShareBridge ?? '')) return false;
  if ((aData.audioBridge ?? '') !== (bData.audioBridge ?? '')) return false;
  if ((aData.meetingId ?? '') !== (bData.meetingId ?? '')) return false;
  if ((aData.name ?? '') !== (bData.name ?? '')) return false;
  if ((aData.notifyRecordingIsOn ?? false) !== (bData.notifyRecordingIsOn ?? false)) return false;
  if ((aData.presentationUploadExternalDescription ?? '') !== (bData.presentationUploadExternalDescription ?? '')) return false;
  if ((aData.presentationUploadExternalUrl ?? '') !== (bData.presentationUploadExternalUrl ?? '')) return false;
  if ((aData.endWhenNoModerator ?? false) !== (bData.endWhenNoModerator ?? false)) return false;
  if ((aData.endWhenNoModeratorDelayInMinutes ?? 0) !== (bData.endWhenNoModeratorDelayInMinutes ?? 0)) return false;
  if ((aData.loginUrl ?? '') !== (bData.loginUrl ?? '')) return false;

  const aup = aData.usersPolicies;
  const bup = bData.usersPolicies;
  if ((aup?.allowModsToEjectCameras ?? false) !== (bup?.allowModsToEjectCameras ?? false)) return false;
  if ((aup?.allowModsToUnmuteUsers ?? false) !== (bup?.allowModsToUnmuteUsers ?? false)) return false;
  if ((aup?.authenticatedGuest ?? false) !== (bup?.authenticatedGuest ?? false)) return false;
  if ((aup?.allowPromoteGuestToModerator ?? false) !== (bup?.allowPromoteGuestToModerator ?? false)) return false;
  if ((aup?.guestPolicy ?? '') !== (bup?.guestPolicy ?? '')) return false;
  if ((aup?.maxUserConcurrentAccesses ?? 0) !== (bup?.maxUserConcurrentAccesses ?? 0)) return false;
  if ((aup?.maxUsers ?? 0) !== (bup?.maxUsers ?? 0)) return false;
  if ((aup?.meetingId ?? '') !== (bup?.meetingId ?? '')) return false;
  if ((aup?.meetingLayout ?? '') !== (bup?.meetingLayout ?? '')) return false;
  if ((aup?.userCameraCap ?? 0) !== (bup?.userCameraCap ?? 0)) return false;
  if ((aup?.webcamsOnlyForModerator ?? false) !== (bup?.webcamsOnlyForModerator ?? false)) return false;
  if ((aup?.guestLobbyMessage ?? '') !== (bup?.guestLobbyMessage ?? '')) return false;

  const als = aData.lockSettings;
  const bls = bData.lockSettings;
  if ((als?.disableCam ?? false) !== (bls?.disableCam ?? false)) return false;
  if ((als?.disableMic ?? false) !== (bls?.disableMic ?? false)) return false;
  if ((als?.disableNotes ?? false) !== (bls?.disableNotes ?? false)) return false;
  if ((als?.disablePrivateChat ?? false) !== (bls?.disablePrivateChat ?? false)) return false;
  if ((als?.disablePublicChat ?? false) !== (bls?.disablePublicChat ?? false)) return false;
  if ((als?.presenterPolicy ?? 'requireApproval') !== (bls?.presenterPolicy ?? 'requireApproval')) return false;
  if ((als?.hasActiveLockSetting ?? false) !== (bls?.hasActiveLockSetting ?? false)) return false;
  if ((als?.isolateUsers ?? false) !== (bls?.isolateUsers ?? false)) return false;
  if ((als?.hideViewersCursor ?? false) !== (bls?.hideViewersCursor ?? false)) return false;
  if ((als?.hideViewersAnnotation ?? false) !== (bls?.hideViewersAnnotation ?? false)) return false;
  if ((als?.meetingId ?? false) !== (bls?.meetingId ?? false)) return false;
  if ((als?.webcamsOnlyForModerator ?? false) !== (bls?.webcamsOnlyForModerator ?? false)) return false;

  const avs = aData.voiceSettings;
  const bvs = bData.voiceSettings;
  if ((avs?.dialNumber ?? '') !== (bvs?.dialNumber ?? '')) return false;
  if ((avs?.meetingId ?? '') !== (bvs?.meetingId ?? '')) return false;
  if ((avs?.muteOnStart ?? false) !== (bvs?.muteOnStart ?? false)) return false;
  if ((avs?.telVoice ?? false) !== (bvs?.telVoice ?? false)) return false;
  if ((avs?.voiceConf ?? '') !== (bvs?.voiceConf ?? '')) return false;

  const abp = aData.breakoutPolicies;
  const bbp = bData.breakoutPolicies;
  if ((abp?.breakoutRooms?.length ?? 0) !== (bbp?.breakoutRooms?.length ?? 0)) return false;
  if ((abp?.captureNotes ?? false) !== (bbp?.captureNotes ?? false)) return false;
  if ((abp?.captureNotesFilename ?? '') !== (bbp?.captureNotesFilename ?? '')) return false;
  if ((abp?.captureSlides ?? false) !== (bbp?.captureSlides ?? false)) return false;
  if ((abp?.captureSlidesFilename ?? '') !== (bbp?.captureSlidesFilename ?? '')) return false;
  if ((abp?.freeJoin ?? false) !== (bbp?.freeJoin ?? false)) return false;
  if ((abp?.parentMeetingId ?? '') !== (bbp?.parentMeetingId ?? '')) return false;
  if ((abp?.privateChatEnabled ?? false) !== (bbp?.privateChatEnabled ?? false)) return false;
  if ((abp?.record ?? false) !== (bbp?.record ?? false)) return false;
  if ((abp?.sequence ?? 0) !== (bbp?.sequence ?? 0)) return false;

  const abrcp = aData.breakoutRoomsCommonProperties;
  const bbrcp = bData.breakoutRoomsCommonProperties;
  if ((abrcp?.durationInSeconds ?? 0) !== (bbrcp?.durationInSeconds ?? 0)) return false;
  if ((abrcp?.freeJoin ?? false) !== (bbrcp?.freeJoin ?? false)) return false;
  if ((abrcp?.sendInvitationToModerators ?? false) !== (bbrcp?.sendInvitationToModerators ?? false)) return false;
  if (abrcp?.startedAt !== bbrcp?.startedAt) return false;

  const aev = aData.externalVideo;
  const bev = bData.externalVideo;
  if ((aev?.externalVideoId ?? '') !== (bev?.externalVideoId ?? '')) return false;
  if ((aev?.playerCurrentTime ?? 0) !== (bev?.playerCurrentTime ?? 0)) return false;
  if ((aev?.playerPlaybackRate ?? 0) !== (bev?.playerPlaybackRate ?? 0)) return false;
  if ((aev?.playerPlaying ?? false) !== (bev?.playerPlaying ?? false)) return false;
  if ((aev?.externalVideoUrl ?? '') !== (bev?.externalVideoUrl ?? '')) return false;
  if ((aev?.startedSharingAt ?? 0) !== (bev?.startedSharingAt ?? 0)) return false;
  if ((aev?.stoppedSharingAt ?? 0) !== (bev?.stoppedSharingAt ?? 0)) return false;
  if ((aev?.updatedAt ?? 0) !== (bev?.updatedAt ?? 0)) return false;

  const al = aData.layout;
  const bl = bData.layout;
  if ((al?.updatedAt ?? 0) !== (bl?.updatedAt ?? 0)) return false;
  if ((al?.currentLayoutType ?? '') !== (bl?.currentLayoutType ?? '')) return false;
  if ((al?.propagateLayout ?? false) !== (bl?.propagateLayout ?? false)) return false;
  if ((al?.cameraDockIsResizing ?? false) !== (bl?.cameraDockIsResizing ?? false)) return false;
  if ((al?.cameraDockPlacement ?? '') !== (bl?.cameraDockPlacement ?? '')) return false;
  if ((al?.cameraDockAspectRatio ?? '') !== (bl?.cameraDockAspectRatio ?? '')) return false;
  if ((al?.cameraWithFocus ?? '') !== (bl?.cameraWithFocus ?? '')) return false;
  if ((al?.presentationMinimized ?? false) !== (bl?.presentationMinimized ?? false)) return false;
  if ((al?.setByUserId ?? '') !== (bl?.setByUserId ?? '')) return false;

  const acf = aData.componentsFlags;
  const bcf = bData.componentsFlags;
  if ((acf?.hasBreakoutRoom ?? false) !== (bcf?.hasBreakoutRoom ?? false)) return false;
  if ((acf?.hasCameraAsContent ?? false) !== (bcf?.hasCameraAsContent ?? false)) return false;
  if ((acf?.hasCaption ?? false) !== (bcf?.hasCaption ?? false)) return false;
  if ((acf?.hasCurrentPresentation ?? false) !== (bcf?.hasCurrentPresentation ?? false)) return false;
  if ((acf?.hasExternalVideo ?? false) !== (bcf?.hasExternalVideo ?? false)) return false;
  if ((acf?.hasPoll ?? false) !== (bcf?.hasPoll ?? false)) return false;
  if ((acf?.hasScreenshare ?? false) !== (bcf?.hasScreenshare ?? false)) return false;
  if ((acf?.hasScreenshareAsContent ?? false) !== (bcf?.hasScreenshareAsContent ?? false)) return false;
  if ((acf?.hasSharedNotes ?? false) !== (bcf?.hasSharedNotes ?? false)) return false;
  if ((acf?.hasTimer ?? false) !== (bcf?.hasTimer ?? false)) return false;
  if ((acf?.isSharedNotesPinned ?? false) !== (bcf?.isSharedNotesPinned ?? false)) return false;
  if ((acf?.showRemainingTime ?? false) !== (bcf?.showRemainingTime ?? false)) return false;

  return true;
};

export default meetingComparator;
