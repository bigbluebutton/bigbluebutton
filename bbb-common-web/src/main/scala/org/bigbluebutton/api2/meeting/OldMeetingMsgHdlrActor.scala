package org.bigbluebutton.api2.meeting

import java.util
import org.apache.pekko.actor.{Actor, ActorLogging, Props}
import org.bigbluebutton.api.messaging.messages._
import org.bigbluebutton.api2.bus.OldMessageReceivedGW
import org.bigbluebutton.common2.msgs._

object OldMeetingMsgHdlrActor {
  def props(olgMsgGW: OldMessageReceivedGW): Props =
    Props(classOf[OldMeetingMsgHdlrActor], olgMsgGW)
}

class OldMeetingMsgHdlrActor(val olgMsgGW: OldMessageReceivedGW)
  extends Actor with ActorLogging {

  def receive = {
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      case m: MeetingCreatedEvtMsg              => handleMeetingCreatedEvtMsg(m)
      case m: MeetingEndedEvtMsg                => handleMeetingEndedEvtMsg(m)
      case m: MeetingDestroyedEvtMsg            => handleMeetingDestroyedEvtMsg(m)
      case m: CheckAlivePongSysMsg              => handleCheckAlivePongSysMsg(m)
      case m: PresenterUnassignedEvtMsg         => handlePresenterUnassignedEvtMsg(m)
      case m: PresenterAssignedEvtMsg           => handlePresenterAssignedEvtMsg(m)
      case m: UserJoinedMeetingEvtMsg           => handleUserJoinedMeetingEvtMsg(m)
      case m: UserLeftMeetingEvtMsg             => handleUserLeftMeetingEvtMsg(m)
      case m: UserJoinedVoiceConfToClientEvtMsg => handleUserJoinedVoiceConfToClientEvtMsg(m)
      case m: UserLeftVoiceConfToClientEvtMsg   => handleUserLeftVoiceConfToClientEvtMsg(m)
      case m: UserRoleChangedEvtMsg             => handleUserRoleChangedEvtMsg(m)
      case m: UserLockedInMeetingEvtMsg         => handleUserLockedInMeetingEvtMsg(m)
      case m: UserBroadcastCamStartedEvtMsg     => handleUserBroadcastCamStartedEvtMsg(m)
      case m: UserBroadcastCamStoppedEvtMsg     => handleUserBroadcastCamStoppedEvtMsg(m)
      case m: CreateBreakoutRoomSysCmdMsg       => handleCreateBreakoutRoomSysCmdMsg(m)
      case m: PresentationUploadTokenSysPubMsg  => handlePresentationUploadTokenSysPubMsg(m)
      case m: GuestsWaitingApprovedEvtMsg       => handleGuestsWaitingApprovedEvtMsg(m)
      case m: PosInWaitingQueueUpdatedRespMsg   => handlePosInWaitingQueueUpdatedRespMsg(m)
      case m: GuestPolicyChangedEvtMsg          => handleGuestPolicyChangedEvtMsg(m)
      case m: LockSettingsInMeetingChangedEvtMsg => handleLockSettingsInMeetingChangedEvtMsg(m)
      case m: WebcamsOnlyForModeratorChangedEvtMsg => handleWebcamsOnlyForModeratorChangedEvtMsg(m)
      case m: GuestLobbyMessageChangedEvtMsg    => handleGuestLobbyMessageChangedEvtMsg(m)
      case m: PrivateGuestLobbyMsgChangedEvtMsg => handlePrivateGuestLobbyMsgChangedEvtMsg(m)
      case m: RecordingChapterBreakSysMsg       => handleRecordingChapterBreakSysMsg(m)
      case m: SetPresentationDownloadableEvtMsg => handleSetPresentationDownloadableEvtMsg(m)
      case m: RecordingStatusChangedEvtMsg      => handleRecordingStatusChangedEvtMsg(m)
      case m: LearningDashboardEvtMsg           => handleLearningDashboardEvtMsg(m)
      case _                                    => log.error("***** Cannot handle " + msg.envelope.name)
    }
  }

  def handleGuestPolicyChangedEvtMsg(msg: GuestPolicyChangedEvtMsg): Unit = {
    olgMsgGW.handle(new GuestPolicyChanged(msg.header.meetingId, msg.body.policy))
  }

  def handleLockSettingsInMeetingChangedEvtMsg(msg: LockSettingsInMeetingChangedEvtMsg): Unit = {
    olgMsgGW.handle(new LockSettingsChanged(msg.header.meetingId,
                                            msg.body.disableCam,
                                            msg.body.disableMic,
                                            msg.body.disablePrivChat,
                                            msg.body.disablePubChat,
                                            msg.body.disableNotes,
                                            msg.body.hideUserList,
                                            msg.body.lockOnJoin,
                                            msg.body.lockOnJoinConfigurable,
                                            msg.body.hideViewersCursor,
                                            msg.body.hideViewersAnnotation,
    ))
  }

  def handleWebcamsOnlyForModeratorChangedEvtMsg(msg: WebcamsOnlyForModeratorChangedEvtMsg): Unit = {
    olgMsgGW.handle(new WebcamsOnlyForModeratorChanged(msg.header.meetingId, msg.body.webcamsOnlyForModerator))
  }

  def handleGuestLobbyMessageChangedEvtMsg(msg: GuestLobbyMessageChangedEvtMsg): Unit = {
    olgMsgGW.handle(new GuestLobbyMessageChanged(msg.header.meetingId, msg.body.message))
  }

  def handlePrivateGuestLobbyMsgChangedEvtMsg(msg: PrivateGuestLobbyMsgChangedEvtMsg): Unit = {
    olgMsgGW.handle(new PrivateGuestLobbyMessageChanged(msg.header.meetingId, msg.body.guestId, msg.body.message))
  }

  def handlePosInWaitingQueueUpdatedRespMsg(msg: PosInWaitingQueueUpdatedRespMsg): Unit = {
    val guestUsers: util.HashMap[String, String] = new util.HashMap[String, String]()
    msg.body.guests.foreach(guest => guestUsers.put(guest.intId, guest.idx))
    val m = new PositionInWaitingQueueUpdated(msg.header.meetingId, guestUsers)
    olgMsgGW.handle(m)
  }

  def handleRecordingChapterBreakSysMsg(msg: RecordingChapterBreakSysMsg): Unit = {
    olgMsgGW.handle(new RecordChapterBreak(msg.body.meetingId, msg.body.timestamp))
  }

  def handleMeetingCreatedEvtMsg(msg: MeetingCreatedEvtMsg): Unit = {
    olgMsgGW.handle(new MeetingStarted(msg.body.props.meetingProp.intId))
  }

  def handleMeetingEndedEvtMsg(msg: MeetingEndedEvtMsg): Unit = {
    olgMsgGW.handle(new MeetingEnded(msg.body.meetingId))
  }

  def handleMeetingDestroyedEvtMsg(msg: MeetingDestroyedEvtMsg): Unit = {
    olgMsgGW.handle(new MeetingDestroyed(msg.body.meetingId))
  }

  def handleCreateBreakoutRoomSysCmdMsg(msg: CreateBreakoutRoomSysCmdMsg): Unit = {
    olgMsgGW.handle(new CreateBreakoutRoom(
      msg.body.room.breakoutMeetingId,
      msg.body.room.parentId,
      msg.body.room.name,
      msg.body.room.sequence,
      msg.body.room.shortName,
      msg.body.room.isDefaultName,
      msg.body.room.freeJoin,
      msg.body.room.dialNumber,
      msg.body.room.voiceConfId,
      msg.body.room.viewerPassword,
      msg.body.room.moderatorPassword,
      msg.body.room.durationInMinutes,
      msg.body.room.sourcePresentationId,
      msg.body.room.sourcePresentationSlide,
      msg.body.room.record,
      msg.body.room.privateChatEnabled,
      msg.body.room.captureNotes,
      msg.body.room.captureSlides,
      msg.body.room.captureNotesFilename,
      msg.body.room.captureSlidesFilename,
    ))
    
  }

  def handleRecordingStatusChangedEvtMsg(msg: RecordingStatusChangedEvtMsg): Unit = {
    olgMsgGW.handle(new UpdateRecordingStatus(msg.header.meetingId, msg.body.recording));
  }

  def handleCheckAlivePongSysMsg(msg: CheckAlivePongSysMsg): Unit = {
    olgMsgGW.handle(new org.bigbluebutton.api.messaging.messages.KeepAliveReply(msg.body.system, msg.body.bbbWebTimestamp,
      msg.body.akkaAppsTimestamp))
  }

  def handleUserJoinedMeetingEvtMsg(msg: UserJoinedMeetingEvtMsg): Unit = {
    olgMsgGW.handle(new UserJoined(msg.header.meetingId, msg.body.intId,
      msg.body.extId, msg.body.name, msg.body.role, msg.body.locked, msg.body.avatar, msg.body.webcamBackground,
      msg.body.guest, msg.body.guestStatus, msg.body.clientType))
  }

  def handlePresenterUnassignedEvtMsg(msg: PresenterUnassignedEvtMsg): Unit = {
    olgMsgGW.handle(new UserStatusChanged(msg.header.meetingId, msg.body.intId, "presenter", "false"))
  }

  def handlePresenterAssignedEvtMsg(msg: PresenterAssignedEvtMsg): Unit = {
    olgMsgGW.handle(new UserStatusChanged(msg.header.meetingId, msg.body.presenterId, "presenter", "true"))
  }

  def handleUserLeftMeetingEvtMsg(msg: UserLeftMeetingEvtMsg): Unit = {
    olgMsgGW.handle(new UserLeft(msg.header.meetingId, msg.body.intId))
  }

  def handleUserJoinedVoiceConfToClientEvtMsg(msg: UserJoinedVoiceConfToClientEvtMsg): Unit = {
    if (msg.body.listenOnly) {
      olgMsgGW.handle(new UserListeningOnly(msg.header.meetingId, msg.body.intId, msg.body.listenOnly))
    } else {
      olgMsgGW.handle(new UserJoinedVoice(msg.header.meetingId, msg.body.intId, msg.body.callerName))
    }
  }

  def handleUserLeftVoiceConfToClientEvtMsg(msg: UserLeftVoiceConfToClientEvtMsg): Unit = {
    olgMsgGW.handle(new UserLeftVoice(msg.header.meetingId, msg.body.intId))
  }

  def handleUserBroadcastCamStartedEvtMsg(msg: UserBroadcastCamStartedEvtMsg): Unit = {
    olgMsgGW.handle(new UserSharedWebcam(msg.header.meetingId, msg.body.userId, msg.body.stream))
  }

  def handleUserBroadcastCamStoppedEvtMsg(msg: UserBroadcastCamStoppedEvtMsg): Unit = {
    olgMsgGW.handle(new UserUnsharedWebcam(msg.header.meetingId, msg.body.userId, msg.body.stream))
  }

  def handleUserRoleChangedEvtMsg(msg: UserRoleChangedEvtMsg): Unit = {
    olgMsgGW.handle(new UserRoleChanged(msg.header.meetingId, msg.body.userId, msg.body.role))
  }

  def handleUserLockedInMeetingEvtMsg(msg: UserLockedInMeetingEvtMsg): Unit = {
    olgMsgGW.handle(new UserLockedInMeeting(msg.header.meetingId, msg.body.userId, msg.body.locked))
  }

  def handlePresentationUploadTokenSysPubMsg(msg: PresentationUploadTokenSysPubMsg): Unit = {
    olgMsgGW.handle(new PresentationUploadToken(msg.body.podId, msg.body.authzToken, msg.body.filename, msg.body.meetingId, msg.body.presentationId))
  }

  def handleGuestsWaitingApprovedEvtMsg(msg: GuestsWaitingApprovedEvtMsg): Unit = {
    val u: util.ArrayList[GuestsStatus] = new util.ArrayList[GuestsStatus]()
    msg.body.guests.foreach(g => u.add(new GuestsStatus(g.guest, g.status)))
    val m = new GuestStatusChangedEventMsg(msg.header.meetingId, u)
    olgMsgGW.handle(m)
  }

  def handleSetPresentationDownloadableEvtMsg(msg: SetPresentationDownloadableEvtMsg): Unit = {
    val meetingId = msg.header.meetingId
    val presId = msg.body.presentationId
    val downloadable = msg.body.downloadable
    val presFilename = msg.body.presFilename
    val downloadableExtension = msg.body.downloadableExtension;
    val m = new MakePresentationDownloadableMsg(meetingId, presId, presFilename, downloadable, downloadableExtension)
    olgMsgGW.handle(m)
  }

  def handleLearningDashboardEvtMsg(msg: LearningDashboardEvtMsg): Unit = {
    olgMsgGW.handle(new LearningDashboard(msg.header.meetingId, msg.body.learningDashboardAccessToken, msg.body.activityJson))
  }

}
