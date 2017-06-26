package org.bigbluebutton.core2.message.handlers.breakoutrooms

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.messages.breakoutrooms._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.BreakoutRooms
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.MeetingActor

trait TransferUserToMeetingRequestHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleTransferUserToMeetingRequestMsg(msg: TransferUserToMeetingRequestMsg): Unit = {

    def broadcastEvent(msg: TransferUserToMeetingRequestMsg): Unit = {
      var targetVoiceBridge: String = msg.body.targetMeetingId
      // If the current room is a parent room we fetch the voice bridge from the breakout room
      if (!props.meetingProp.isBreakout) {
        BreakoutRooms.getBreakoutRoom(liveMeeting.breakoutRooms, msg.body.targetMeetingId) match {
          case Some(b) => {
            targetVoiceBridge = b.voiceConfId;
          }
          case None => // do nothing
        }
      } // if it is a breakout room, the target voice bridge is the same after removing the last digit
      else {
        targetVoiceBridge = props.voiceProp.voiceConf.dropRight(1)
      }
      // We check the user from the mode
      Users.findWithId(msg.body.userId, liveMeeting.users) match {
        case Some(u) => {
          if (u.voiceUser.joined) {
            log.info("Transferring user userId=" + u.id + " from voiceBridge=" + props.voiceProp.voiceConf + " to targetVoiceConf=" + targetVoiceBridge)

            val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
            val envelope = BbbCoreEnvelope(TransferUserToMeetingEvtMsg.NAME, routing)
            val header = BbbClientMsgHeader(TransferUserToMeetingEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

            val body = TransferUserToMeetingEvtMsgBody(props.voiceProp.voiceConf, targetVoiceBridge, u.voiceUser.userId)
            val event = TransferUserToMeetingEvtMsg(header, body)
            val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

            outGW.send(msgEvent)
          }
        }
        case None => // do nothing
      }
    }

    broadcastEvent(msg)
  }
}