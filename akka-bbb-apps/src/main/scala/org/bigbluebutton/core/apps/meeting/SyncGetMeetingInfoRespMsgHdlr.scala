package org.bigbluebutton.core.apps.meeting

import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter

trait SyncGetMeetingInfoRespMsgHdlr {

  val outGW: OutMsgRouter

  def handleSyncGetMeetingInfoRespMsg(props: DefaultProps): Unit = {
    val routing = Routing.addMsgToHtml5InstanceIdRouting(props.meetingProp.intId, props.systemProps.html5InstanceId.toString)
    val envelope = BbbCoreEnvelope(SyncGetMeetingInfoRespMsg.NAME, routing)
    val header = BbbCoreBaseHeader(SyncGetMeetingInfoRespMsg.NAME)

    val body = SyncGetMeetingInfoRespMsgBody(props)
    val event = SyncGetMeetingInfoRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }
}
