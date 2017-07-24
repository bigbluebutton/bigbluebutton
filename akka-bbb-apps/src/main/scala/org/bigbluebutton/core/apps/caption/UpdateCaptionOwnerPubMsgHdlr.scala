package org.bigbluebutton.core.apps.caption

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter

trait UpdateCaptionOwnerPubMsgHdlr {
  this: CaptionApp2x =>

  val outGW: OutMsgRouter

  def handleUpdateCaptionOwnerPubMsg(msg: UpdateCaptionOwnerPubMsg): Unit = {
    updateCaptionOwner(msg.body.locale, msg.body.localeCode, msg.body.ownerId).foreach(f => {
      broadcastUpdateCaptionOwnerEvent(f._1, f._2.localeCode, f._2.ownerId)
    })
  }

  def broadcastUpdateCaptionOwnerEvent(locale: String, localeCode: String, newOwnerId: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, newOwnerId)
    val envelope = BbbCoreEnvelope(UpdateCaptionOwnerEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UpdateCaptionOwnerEvtMsg.NAME, liveMeeting.props.meetingProp.intId, newOwnerId)

    val body = UpdateCaptionOwnerEvtMsgBody(locale, localeCode, newOwnerId)
    val event = UpdateCaptionOwnerEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)

    //record(event)
  }
}
