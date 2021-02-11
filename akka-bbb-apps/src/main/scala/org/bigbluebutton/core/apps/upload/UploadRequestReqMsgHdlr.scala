package org.bigbluebutton.core.apps.upload

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.util.RandomStringGenerator

trait UploadRequestReqMsgHdlr extends RightsManagementTrait {
  this: UploadApp2x =>

  def handle(
      msg:         UploadRequestReqMsg,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ): Unit = {

    val meetingId = liveMeeting.props.meetingProp.intId
    val userId = msg.header.userId
    val source = msg.body.source
    val filename = msg.body.filename
    val timestamp = msg.body.timestamp
    
    // To system
    def broadcastUploadRequestSysMsg(
        msg:   UploadRequestReqMsg,
        token: String
    ): Unit = {

      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(UploadRequestSysMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(UploadRequestSysMsg.NAME, meetingId)
      val body = UploadRequestSysMsgBody(source, filename, userId, token)
      val event = UploadRequestSysMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    // To client
    def broadcastUploadRequestRespMsg(
        msg:     UploadRequestReqMsg,
        success: Boolean             = false,
        token:   String              = null
    ): Unit = {

      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(UploadRequestRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(UploadRequestRespMsg.NAME, meetingId, userId)
      val body = UploadRequestRespMsgBody(source, filename, userId, success, timestamp, token)
      val event = UploadRequestRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.MOD_LEVEL, liveMeeting.users2x, userId)) {
      broadcastUploadRequestRespMsg(msg)
    } else {
      val token = RandomStringGenerator.randomAlphanumericString(32)
      broadcastUploadRequestSysMsg(msg, token)
      broadcastUploadRequestRespMsg(msg, true, token)
    }
  }
}
