package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.BreakoutModel
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ VoiceUsers }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait TransferUserToMeetingRequestHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleTransferUserToMeetingRequestMsg(msg: TransferUserToMeetingRequestMsg, state: MeetingState2x): MeetingState2x = {

    for {
      model <- state.breakout
      to <- getVoiceConf(msg.body.targetMeetingId, model)
      from <- getVoiceConf(msg.body.meetingId, model)
      voiceUser <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.body.userId)
    } yield {
      val event = buildTransferUserToVoiceConfSysMsg(from, to, voiceUser.voiceUserId)
      outGW.send(event)
    }

    state
  }

  def buildTransferUserToVoiceConfSysMsg(fromVoiceConf: String, toVoiceConf: String, voiceUserId: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(TransferUserToVoiceConfSysMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(TransferUserToVoiceConfSysMsg.NAME, props.meetingProp.intId)

    val body = TransferUserToVoiceConfSysMsgBody(fromVoiceConf, toVoiceConf, voiceUserId)
    val event = TransferUserToVoiceConfSysMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def getVoiceConf(meetingId: String, breakoutModel: BreakoutModel): Option[String] = {
    if (meetingId == liveMeeting.props.meetingProp.intId) {
      Some(liveMeeting.props.voiceProp.voiceConf)
    } else {
      for {
        room <- breakoutModel.find(meetingId)
      } yield room.voiceConf
    }
  }
}
