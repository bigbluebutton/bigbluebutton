package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.{ BreakoutRooms, Users2x, VoiceUser2x, VoiceUsers }
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
      VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.body.userId) match {
        case Some(u) =>
          log.info("Transferring user userId=" + u.intId + " from voiceBridge=" + props.voiceProp.voiceConf + " to targetVoiceConf=" + targetVoiceBridge)

          val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
          val envelope = BbbCoreEnvelope(TransferUserToMeetingEvtMsg.NAME, routing)
          val header = BbbClientMsgHeader(TransferUserToMeetingEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

          val body = TransferUserToMeetingEvtMsgBody(props.voiceProp.voiceConf, targetVoiceBridge, u.voiceUserId)
          val event = TransferUserToMeetingEvtMsg(header, body)
          val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

          outGW.send(msgEvent)

        case None => // do nothing
      }
    }

    broadcastEvent(msg)
  }
}
