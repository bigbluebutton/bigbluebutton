import { User } from '/imports/ui/Types/user';

export const userComparator = (a?: Partial<User>, b?: Partial<User>): boolean => {
  if (a === b) return true;
  if (!a && !b) return true;
  if (!a || !b) return false;

  if (a.authToken !== b.authToken) return false;
  if ((a.avatar ?? '') !== (b.avatar ?? '')) return false;
  if ((a.webcamBackground ?? '') !== (b.webcamBackground ?? '')) return false;
  if ((a.away ?? false) !== (b.away ?? false)) return false;
  if ((a.clientType ?? '') !== (b.clientType ?? '')) return false;
  if ((a.color ?? '') !== (b.color ?? '')) return false;
  if ((a.ejectReason ?? '') !== (b.ejectReason ?? '')) return false;
  if ((a.ejectReasonCode ?? '') !== (b.ejectReasonCode ?? '')) return false;
  if ((a.ejected ?? false) !== (b.ejected ?? false)) return false;
  if ((a.reactionEmoji ?? '') !== (b.reactionEmoji ?? '')) return false;
  if ((a.extId ?? '') !== (b.extId ?? '')) return false;
  if ((a.guest ?? false) !== (b.guest ?? false)) return false;
  if ((a.guestStatus ?? '') !== (b.guestStatus ?? '')) return false;
  if ((a.whiteboardWriteAccess ?? false) !== (b.whiteboardWriteAccess ?? false)) return false;
  if ((a.inactivityWarningDisplay ?? false) !== (b.inactivityWarningDisplay ?? false)) return false;
  if ((a.inactivityWarningTimeoutSecs ?? 0) !== (b.inactivityWarningTimeoutSecs ?? 0)) return false;
  if ((a.isDialIn ?? false) !== (b.isDialIn ?? false)) return false;
  if (!!a.isModerator !== !!b.isModerator) return false;
  if ((a.logoutUrl ?? '') !== (b.logoutUrl ?? '')) return false;
  if ((a.currentlyInMeeting ?? false) !== (b.currentlyInMeeting ?? false)) return false;
  if ((a.joinErrorCode ?? '') !== (b.joinErrorCode ?? '')) return false;
  if ((a.joinErrorMessage ?? '') !== (b.joinErrorMessage ?? '')) return false;
  if ((a.joined ?? false) !== (b.joined ?? false)) return false;
  if ((a.locked ?? false) !== (b.locked ?? false)) return false;
  if ((a.loggedOut ?? false) !== (b.loggedOut ?? false)) return false;
  if ((a.mobile ?? false) !== (b.mobile ?? false)) return false;
  if ((a.bot ?? false) !== (b.bot ?? false)) return false;
  if ((a.name ?? '') !== (b.name ?? '')) return false;
  if ((a.nameSortable ?? '') !== (b.nameSortable ?? '')) return false;
  if (!!a.pinned !== !!b.pinned) return false;
  if (!!a.presenter !== !!b.presenter) return false;
  if ((a.raiseHand ?? false) !== (b.raiseHand ?? false)) return false;
  if ((a.registeredAt ?? 0) !== (b.registeredAt ?? 0)) return false;
  if ((a.requestedUnmuteByMod ?? false) !== (b.requestedUnmuteByMod ?? false)) return false;
  if ((a.role ?? '') !== (b.role ?? '')) return false;
  if ((a.speechLocale ?? '') !== (b.speechLocale ?? '')) return false;
  if ((a.captionLocale ?? '') !== (b.captionLocale ?? '')) return false;
  if ((a.userId ?? '') !== (b.userId ?? '')) return false;

  const am = a.meeting;
  const bm = b.meeting;
  if ((am?.ended ?? false) !== (bm?.ended ?? false)) return false;
  if ((am?.endedReasonCode ?? '') !== (bm?.endedReasonCode ?? '')) return false;
  if ((am?.endedByUserName ?? '') !== (bm?.endedByUserName ?? '')) return false;
  if ((am?.logoutUrl ?? '') !== (bm?.logoutUrl ?? '')) return false;

  const albr = a.lastBreakoutRoom;
  const blbr = b.lastBreakoutRoom;
  if ((albr?.isUserCurrentlyInRoom ?? false) !== (blbr?.isUserCurrentlyInRoom ?? false)) return false;
  if ((albr?.sequence ?? 0) !== (blbr?.sequence ?? 0)) return false;
  if ((albr?.shortName ?? '') !== (blbr?.shortName ?? '')) return false;

  const abr = a.breakoutRoomsSummary;
  const bbr = b.breakoutRoomsSummary;
  if ((abr?.totalOfBreakoutRooms ?? 0) !== (bbr?.totalOfBreakoutRooms ?? 0)) return false;
  if ((abr?.totalOfIsUserCurrentlyInRoom ?? 0) !== (bbr?.totalOfIsUserCurrentlyInRoom ?? 0)) return false;
  if ((abr?.totalOfShowInvitation ?? 0) !== (bbr?.totalOfShowInvitation ?? 0)) return false;
  if ((abr?.totalOfJoinURL ?? 0) !== (bbr?.totalOfJoinURL ?? 0)) return false;

  // cameras length should be a good proxy for camera state changes
  if (((a.cameras ?? []).length) !== ((b.cameras ?? []).length)) return false;

  const av = a.voice;
  const bv = b.voice;
  if ((av?.joined ?? false) !== (bv?.joined ?? false)) return false;
  if ((av?.spoke ?? false) !== (bv?.spoke ?? false)) return false;
  if ((av?.listenOnly ?? false) !== (bv?.listenOnly ?? false)) return false;
  if ((av?.deafened ?? false) !== (bv?.deafened ?? false)) return false;
  if ((av?.listenOnlyInputDevice ?? '') !== (bv?.listenOnlyInputDevice ?? '')) return false;

  const auls = a.userLockSettings;
  const buls = b.userLockSettings;
  if ((auls?.disablePublicChat ?? false) !== (buls?.disablePublicChat ?? false)) return false;

  const aSession = a.sessionCurrent;
  const bSession = b.sessionCurrent;
  if ((aSession?.enforceLayout ?? false) !== (bSession?.enforceLayout ?? false)) return false;

  const aLivekit = a.livekit;
  const bLivekit = b.livekit;
  if ((aLivekit?.livekitToken ?? '') !== (bLivekit?.livekitToken ?? '')) return false;

  return true;
};

export default userComparator;
