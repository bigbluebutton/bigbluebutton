package org.bigbluebutton.api2.meeting

import org.bigbluebutton.api2.bus.MsgToAkkaAppsEventBus
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.messages._


trait ToAkkaAppsSendersTrait {
  val msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus

  def sendCreateMeetingRequestToAkkaApps(props: DefaultProps): Unit = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
    val header = BbbCoreHeader(CreateMeetingReqMsg.NAME)
    val body = CreateMeetingReqMsgBody(props)
    val req = CreateMeetingReqMsg(header, body)
    val msg = BbbCommonEnvCoreMsg(envelope, req)
  }
}
