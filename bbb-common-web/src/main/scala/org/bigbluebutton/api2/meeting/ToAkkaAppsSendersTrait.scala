package org.bigbluebutton.api2.meeting

import org.bigbluebutton.api2.SystemConfiguration
import org.bigbluebutton.api2.bus.{MsgToAkkaApps, MsgToAkkaAppsEventBus}
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.messages._


trait ToAkkaAppsSendersTrait extends SystemConfiguration{
  val msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus

  def sendToBus(msg: BbbCommonEnvCoreMsg): Unit = {
    msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, msg))
  }

  def sendCreateMeetingRequestToAkkaApps(props: DefaultProps): Unit = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
    val header = BbbCoreHeader(CreateMeetingReqMsg.NAME)
    val body = CreateMeetingReqMsgBody(props)
    val req = CreateMeetingReqMsg(header, body)
    val msg = BbbCommonEnvCoreMsg(envelope, req)
    sendToBus(msg)
  }
}
