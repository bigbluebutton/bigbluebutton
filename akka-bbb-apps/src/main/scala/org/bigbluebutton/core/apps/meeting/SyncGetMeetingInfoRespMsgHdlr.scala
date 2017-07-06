package org.bigbluebutton.core.apps.meeting

import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.msgs._

trait SyncGetMeetingInfoRespMsgHdlr {

  val outGW: OutMessageGateway

  def handleSyncGetMeetingInfoRespMsg(props: DefaultProps): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, props.meetingProp.intId, "nodeJSapp")
    val envelope = BbbCoreEnvelope(SyncGetMeetingInfoRespMsg.NAME, routing)
    val header = BbbCoreBaseHeader(SyncGetMeetingInfoRespMsg.NAME)

    val body = SyncGetMeetingInfoRespMsgBody(props)
    val event = SyncGetMeetingInfoRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }
}
