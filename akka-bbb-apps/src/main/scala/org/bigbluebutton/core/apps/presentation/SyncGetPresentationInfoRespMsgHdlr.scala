package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.domain.PresentationVO
import org.bigbluebutton.core.running.OutMsgRouter

trait SyncGetPresentationInfoRespMsgHdlr {
  this: PresentationApp2x =>

  val outGW: OutMsgRouter

  def handleSyncGetPresentationInfoRespMsg(): Unit = {
    log.debug("Handling SyncGetPresentationInfo")

    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, "nodeJSapp")
    val envelope = BbbCoreEnvelope(SyncGetPresentationInfoRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(SyncGetPresentationInfoRespMsg.NAME, liveMeeting.props.meetingProp.intId, "nodeJSapp")

    val presVOs = getPresentationInfo().map { p =>
      PresentationVO(p.id, p.name, p.current, p.pages.values.toVector, p.downloadable)
    }

    val body = SyncGetPresentationInfoRespMsgBody(presVOs)
    val event = SyncGetPresentationInfoRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }
}
