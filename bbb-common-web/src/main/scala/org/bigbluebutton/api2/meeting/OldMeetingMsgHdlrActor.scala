package org.bigbluebutton.api2.meeting

import java.util

import akka.actor.{Actor, ActorLogging, Props}
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
      case m: MeetingCreatedEvtMsg => handleMeetingCreatedEvtMsg(m)
      case m: MeetingEndedEvtMsg => handleMeetingEndedEvtMsg(m)
      case m: MeetingDestroyedEvtMsg => handleMeetingDestroyedEvtMsg(m)
      case m: CheckAlivePongSysMsg => handleCheckAlivePongSysMsg(m)
      case m: UserEmojiChangedEvtMsg => handleUserEmojiChangedEvtMsg(m)
      case m: PresenterUnassignedEvtMsg => handlePresenterUnassignedEvtMsg(m)
      case m: PresenterAssignedEvtMsg => handlePresenterAssignedEvtMsg(m)
      case m: UserJoinedMeetingEvtMsg => handleUserJoinedMeetingEvtMsg(m)
      case m: UserLeftMeetingEvtMsg => handleUserLeftMeetingEvtMsg(m)
      case m: UserJoinedVoiceConfToClientEvtMsg => handleUserJoinedVoiceConfToClientEvtMsg(m)
      case m: UserLeftVoiceConfToClientEvtMsg => handleUserLeftVoiceConfToClientEvtMsg(m)
      case m: UserRoleChangedEvtMsg => handleUserRoleChangedEvtMsg(m)
      case m: UserBroadcastCamStartedEvtMsg => handleUserBroadcastCamStartedEvtMsg(m)
      case m: UserBroadcastCamStoppedEvtMsg => handleUserBroadcastCamStoppedEvtMsg(m)
      case m: CreateBreakoutRoomSysCmdMsg => handleCreateBreakoutRoomSysCmdMsg(m)
      case m: PresentationUploadTokenSysPubMsg => handlePresentationUploadTokenSysPubMsg(m)
      case m: GuestsWaitingApprovedEvtMsg => handleGuestsWaitingApprovedEvtMsg(m)
      case m: GuestPolicyChangedEvtMsg => handleGuestPolicyChangedEvtMsg(m)
      case m: RecordingChapterBreakSysMsg => handleRecordingChapterBreakSysMsg(m)
      case m: SetPresentationDownloadableEvtMsg => handleSetPresentationDownloadableEvtMsg(m)
      case _ => log.error("***** Cannot handle " + msg.envelope.name)
    }
  }

  def handleGuestPolicyChangedEvtMsg(msg: GuestPolicyChangedEvtMsg): Unit = {
    olgMsgGW.handle(new GuestPolicyChanged(msg.header.meetingId, msg.body.policy))
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
       msg.body.room.freeJoin,
       msg.body.room.voiceConfId,
       msg.body.room.viewerPassword,
       msg.body.room.moderatorPassword,
       msg.body.room.durationInMinutes,
       msg.body.room.sourcePresentationId,
       msg.body.room.sourcePresentationSlide,
       msg.body.room.record
     ))

  }

  def handleCheckAlivePongSysMsg(msg: CheckAlivePongSysMsg): Unit = {
    olgMsgGW.handle(new org.bigbluebutton.api.messaging.messages.KeepAliveReply(msg.body.system, msg.body.timestamp))
  }

  def handleUserJoinedMeetingEvtMsg(msg: UserJoinedMeetingEvtMsg): Unit = {
    olgMsgGW.handle(new UserJoined(msg.header.meetingId, msg.body.intId,
      msg.body.extId, msg.body.name, msg.body.role, msg.body.avatar, msg.body.guest,
      msg.body.guestStatus))

  }

  def handlePresenterUnassignedEvtMsg(msg: PresenterUnassignedEvtMsg): Unit = {
    olgMsgGW.handle(new UserStatusChanged(msg.header.meetingId, msg.body.intId, "presenter", "false"))
  }

  def handlePresenterAssignedEvtMsg(msg: PresenterAssignedEvtMsg): Unit = {
    olgMsgGW.handle(new UserStatusChanged(msg.header.meetingId, msg.body.presenterId, "presenter", "true"))
  }

  def handleUserEmojiChangedEvtMsg(msg: UserEmojiChangedEvtMsg): Unit = {
  //listener.handle(new UserStatusChanged(meetingId, userid, status, value))
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

  def handlePresentationUploadTokenSysPubMsg(msg: PresentationUploadTokenSysPubMsg): Unit = {
   olgMsgGW.handle(new PresentationUploadToken(msg.body.podId, msg.body.authzToken, msg.body.filename))
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
    val m = new MakePresentationDownloadableMsg(meetingId, presId, presFilename, downloadable)
    olgMsgGW.handle(m)
  }

}
