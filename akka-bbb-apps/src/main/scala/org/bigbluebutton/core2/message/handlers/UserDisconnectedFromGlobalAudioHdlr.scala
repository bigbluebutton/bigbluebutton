package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.messages.voiceconf.{ UserJoinedVoiceConfToClientEvtMsg, UserJoinedVoiceConfToClientEvtMsgBody, UserLeftVoiceConfToClientEvtMsg, UserLeftVoiceConfToClientEvtMsgBody }
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ UserDisconnectedFromGlobalAudio, UserLeft, UserListeningOnly }
import org.bigbluebutton.core.models.{ Users, Users2x, VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait UserDisconnectedFromGlobalAudioHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserDisconnectedFromGlobalAudio(msg: UserDisconnectedFromGlobalAudio) {
    log.info("Handling UserDisconnectedToGlobalAudio: meetingId=" + props.meetingProp.intId + " userId=" + msg.userid)

    val user = Users.findWithId(msg.userid, liveMeeting.users)
    user foreach { u =>
      if (MeetingStatus2x.removeGlobalAudioConnection(liveMeeting.status, msg.userid)) {
        if (!u.joinedWeb) {
          for {
            uvo <- Users.userLeft(u.id, liveMeeting.users)
          } yield {
            log.info("Not web user. Send user left message. meetingId=" + props.meetingProp.intId + " userId=" + u.id + " user=" + u)
            outGW.send(new UserLeft(props.meetingProp.intId, props.recordProp.record, uvo))
          }
        } else {
          for {
            uvo <- Users.leftVoiceListenOnly(u.id, liveMeeting.users)
          } yield {
            log.info("UserDisconnectedToGlobalAudio: meetingId=" + props.meetingProp.intId + " userId=" + uvo.id + " user=" + uvo)
            outGW.send(new UserListeningOnly(props.meetingProp.intId, props.recordProp.record, uvo.id, uvo.listenOnly))
          }
        }
      }
    }

    def broadcastEvent(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId,
        vu.intId)
      val envelope = BbbCoreEnvelope(UserLeftVoiceConfToClientEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserLeftVoiceConfToClientEvtMsg.NAME, props.meetingProp.intId, vu.intId)

      val body = UserLeftVoiceConfToClientEvtMsgBody(intId = vu.intId, voiceUserId = vu.intId)

      val event = UserLeftVoiceConfToClientEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      record(event)
    }

    for {
      user <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.userid)
    } yield {
      VoiceUsers.removeWithIntId(liveMeeting.voiceUsers, user.intId)
      broadcastEvent(user)
    }
  }
}
