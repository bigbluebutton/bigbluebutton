package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ BreakoutModel, PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.VoiceUsers
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait TransferUserToMeetingRequestHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleTransferUserToMeetingRequestMsg(msg: TransferUserToMeetingRequestMsg, state: MeetingState2x): MeetingState2x = {
    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to transfer user to voice breakout."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      processRequest(msg)
    }

    state
  }

  def processRequest(msg: TransferUserToMeetingRequestMsg) {
    if (msg.body.fromMeetingId == liveMeeting.props.meetingProp.intId) {
      // want to transfer from parent meeting to breakout
      for {
        model <- state.breakout
        to <- getVoiceConf(msg.body.toMeetingId, model)
        from <- getVoiceConf(msg.body.fromMeetingId, model)
        voiceUser <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.body.userId)
      } yield {
        val event = buildTransferUserToVoiceConfSysMsg(from, to, voiceUser.voiceUserId)
        outGW.send(event)
      }
    } else {

      for {
        model <- state.breakout
        room <- model.find(msg.body.fromMeetingId)
      } yield {
        room.voiceUsers.foreach { vu =>
          log.info(" ***** Breakout voice user={} userId={}", vu, msg.body.userId)
        }
      }

      for {
        model <- state.breakout
        to <- getVoiceConf(msg.body.toMeetingId, model)
        from <- getVoiceConf(msg.body.fromMeetingId, model)
        room <- model.find(msg.body.fromMeetingId)
        voiceUser <- room.voiceUsers.find(p => p.id == msg.body.userId)
      } yield {
        val event = buildTransferUserToVoiceConfSysMsg(from, to, voiceUser.voiceUserId)
        outGW.send(event)
      }
    }
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
