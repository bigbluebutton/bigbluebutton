package org.bigbluebutton.core.apps.caption

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.messages.MessageBody.{ UpdateCaptionOwnerEvtMsgBody }
import org.bigbluebutton.common2.messages._

trait UpdateCaptionOwnerPubMsgHdlr {
  this: CaptionApp2x =>

  val outGW: OutMessageGateway

  def handleUpdateCaptionOwnerPubMsg(msg: UpdateCaptionOwnerPubMsg): Unit = {

    def broadcastEvent(msg: UpdateCaptionOwnerPubMsg, locale: String, localeCode: String, newOwnerId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(UpdateCaptionOwnerEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UpdateCaptionOwnerEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = UpdateCaptionOwnerEvtMsgBody(locale, localeCode, newOwnerId)
      val event = UpdateCaptionOwnerEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    updateCaptionOwner(msg.body.locale, msg.body.localeCode, msg.body.ownerId).foreach(f => {
      broadcastEvent(msg, f._1, f._2.localeCode, f._2.ownerId)
    })
  }
}
