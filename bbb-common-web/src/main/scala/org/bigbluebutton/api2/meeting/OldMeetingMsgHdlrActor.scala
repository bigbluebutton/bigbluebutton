package org.bigbluebutton.api2.meeting

import akka.actor.{Actor, ActorLogging, Props}
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
      case _ => log.error("***** Cannot handle " + msg.envelope.name)
    }
  }

  def handleMeetingCreatedEvtMsg(msg: MeetingCreatedEvtMsg): Unit = {
    // listener.handle(new MeetingStarted(meetingId))
  }

  def handleMeetingEndedEvtMsg(msg: MeetingEndedEvtMsg): Unit = {
    // listener.handle(new MeetingEnded(meetingId))
  }

  def handleMeetingDestroyedEvtMsg(msg: MeetingDestroyedEvtMsg): Unit = {
    // listener.handle(new MeetingDestroyed(meetingId))
  }

//  def handleCreateBreakoutRoomSysCmdMsg(msg: CreateBreakoutRoomSysCmdMsg): Unit = {
 /*   listener.handle(new CreateBreakoutRoom(
      msg.payload.breakoutMeetingId,
      msg.payload.parentMeetingId,
      msg.payload.name,
      msg.payload.sequence,
      msg.payload.voiceConfId,
      msg.payload.viewerPassword,
      msg.payload.moderatorPassword,
      msg.payload.durationInMinutes,
      msg.payload.sourcePresentationId,
      msg.payload.sourcePresentationSlide,
      msg.payload.record
    )
    );
    */
//  }

//  def handleEndBreakoutRoomSysCmdMsg(msg: EndBreakoutRoomSysCmdMsg): Unit = {
    //listener.handle(new EndBreakoutRoom(msg.payload.meetingId))
//  }

//  def handlePubSubPongSysRespMsg(msg: PubSubPongSysRespMsg): Unit = {
    // new KeepAliveReply(m.payload.system, m.payload.timestamp)
//  }

//  def handleUserJoinedMeetingEvtMsg(msg: UserJoinedMeetingEvtMsg): Unit = {
    //       listener.handle(new UserJoined(meetingId, userid, externuserid, username, role, avatarURL, guest, waitingForAcceptance));

//  }

//  def handleUserStausChangedEvtMsg(msg: UserStatusChangedEvtMsg): Unit = {
    //listener.handle(new UserStatusChanged(meetingId, userid, status, value))
//  }

//  def handleUserLeftMeetingEvtMsg(msg: UserLeftMeetingEvtMsg): Unit = {
    // listener.handle(new UserLeft(meetingId, userid))
//  }

  /**
    *     for (MessageListener listener : listeners) {
      listener.handle(new UserJoinedVoice(meetingId, userid));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new UserLeftVoice(meetingId, userid));
    }
    for (MessageListener listener : listeners) {
      listener.handle(new UserListeningOnly(meetingId, userid, listenOnly));
    }
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

}
