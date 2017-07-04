package org.bigbluebutton.api2.meeting

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
      case m: PubSubPongSysRespMsg => handlePubSubPongSysRespMsg(m)
      case m: UserEmojiChangedEvtMsg => handleUserEmojiChangedEvtMsg(m)
      case m: UserJoinedMeetingEvtMsg => handleUserJoinedMeetingEvtMsg(m)
      case m: UserLeftMeetingEvtMsg => handleUserLeftMeetingEvtMsg(m)
      case m: UserJoinedVoiceConfToClientEvtMsg => handleUserJoinedVoiceConfToClientEvtMsg(m)
      case m: UserLeftVoiceConfToClientEvtMsg => handleUserLeftVoiceConfToClientEvtMsg(m)
      case m: UserBroadcastCamStartedEvtMsg => handleUserBroadcastCamStartedEvtMsg(m)
      case m: UserBroadcastCamStoppedEvtMsg => handleUserBroadcastCamStoppedEvtMsg(m)
      case m: CreateBreakoutRoomEvtMsg => handleCreateBreakoutRoomSysCmdMsg(m)
      case m: EndBreakoutRoomEvtMsg => handleEndBreakoutRoomEvtMsg(m)
      case _ => log.error("***** Cannot handle " + msg.envelope.name)
    }
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

  def handleCreateBreakoutRoomSysCmdMsg(msg: CreateBreakoutRoomEvtMsg): Unit = {
    olgMsgGW.handle(new CreateBreakoutRoom(
       msg.body.room.breakoutMeetingId,
       msg.body.room.parentId,
       msg.body.room.name,
       msg.body.room.sequence,
       msg.body.room.voiceConfId,
       msg.body.room.viewerPassword,
       msg.body.room.moderatorPassword,
       msg.body.room.durationInMinutes,
       msg.body.room.sourcePresentationId,
       msg.body.room.sourcePresentationSlide,
       msg.body.room.record
     ))

  }

  def handleEndBreakoutRoomEvtMsg(msg: EndBreakoutRoomEvtMsg): Unit = {
    olgMsgGW.handle(new EndBreakoutRoom(msg.body.breakoutMeetingId))
  }

  def handlePubSubPongSysRespMsg(msg: PubSubPongSysRespMsg): Unit = {
    olgMsgGW.handle(new org.bigbluebutton.api.messaging.messages.KeepAliveReply(msg.body.system, msg.body.timestamp))
  }

  def handleUserJoinedMeetingEvtMsg(msg: UserJoinedMeetingEvtMsg): Unit = {
    olgMsgGW.handle(new UserJoined(msg.header.meetingId, msg.body.intId,
      msg.body.extId, msg.body.name, msg.body.role, msg.body.avatar, msg.body.guest, msg.body.waitingForAcceptance))

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
      olgMsgGW.handle(new UserJoinedVoice(msg.header.meetingId, msg.body.intId))
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


  /**
    for (MessageListener listener : listeners) {
      listener.handle(new UserSharedWebcam(meetingId, userid, stream));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new UserUnsharedWebcam(meetingId, userid, stream));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new UserRoleChanged(meetingId, userid, role));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new StunTurnInfoRequested(meetingId, requesterId));
    }
    */


  /**
    *         if (message instanceof MeetingStarted) {
          meetingStarted((MeetingStarted) message);
        } else if (message instanceof MeetingDestroyed) {
          meetingDestroyed((MeetingDestroyed) message);
        } else if (message instanceof MeetingEnded) {
          meetingEnded((MeetingEnded) message);
        } else if (message instanceof UserJoined) {
          userJoined((UserJoined) message);
        } else if (message instanceof UserLeft) {
          userLeft((UserLeft) message);
        } else if (message instanceof UserStatusChanged) {
          updatedStatus((UserStatusChanged) message);
        } else if (message instanceof UserRoleChanged) {
          userRoleChanged((UserRoleChanged) message);
        } else if (message instanceof UserJoinedVoice) {
          userJoinedVoice((UserJoinedVoice) message);
        } else if (message instanceof UserLeftVoice) {
          userLeftVoice((UserLeftVoice) message);
        } else if (message instanceof UserListeningOnly) {
          userListeningOnly((UserListeningOnly) message);
        } else if (message instanceof UserSharedWebcam) {
          userSharedWebcam((UserSharedWebcam) message);
        } else if (message instanceof UserUnsharedWebcam) {
          userUnsharedWebcam((UserUnsharedWebcam) message);
        } else if (message instanceof CreateMeeting) {
          processCreateMeeting((CreateMeeting) message);
        } else if (message instanceof EndMeeting) {
          processEndMeeting((EndMeeting) message);
        } else if (message instanceof RegisterUser) {
          processRegisterUser((RegisterUser) message);
        } else if (message instanceof StunTurnInfoRequested) {
          processStunTurnInfoRequested((StunTurnInfoRequested) message);
        } else if (message instanceof CreateBreakoutRoom) {
          processCreateBreakoutRoom((CreateBreakoutRoom) message);
        } else if (message instanceof EndBreakoutRoom) {
          processEndBreakoutRoom((EndBreakoutRoom) message);
        }

    */



}
