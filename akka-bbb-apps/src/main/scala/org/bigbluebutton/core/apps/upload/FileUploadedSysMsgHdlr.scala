package org.bigbluebutton.core.apps.upload

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting

trait FileUploadedSysMsgHdlr {
  this: UploadApp2x =>

  def handle(
      msg:         FileUploadedSysMsg,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ): Unit = {

    val meetingId = liveMeeting.props.meetingProp.intId
    val userId = msg.header.userId

    def broadcastFileUploadedEvtMsg(msg: FileUploadedSysMsg): Unit = {
      val uploadId = msg.body.uploadId
      val source = msg.body.source
      val filename = msg.body.filename
      
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(FileUploadedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(FileUploadedEvtMsg.NAME, meetingId, userId)
      val body = FileUploadedEvtMsgBody(uploadId, source, filename)
      val event = FileUploadedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    broadcastFileUploadedEvtMsg(msg)
  }
}
