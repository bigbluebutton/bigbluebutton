package org.bigbluebutton.core.running

import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
//import org.bigbluebutton.core.api.BreakoutRoomCreated
import org.bigbluebutton.core.bus.{ BigBlueButtonEvent, IncomingEventBus }

trait AuditHelpers {

  def getUsersInVoiceConf(
    props: DefaultProps,
    outGW: OutMessageGateway
  ): Unit = {
    def buildGetUsersInVoiceConfSysMsg(meetingId: String): BbbCommonEnvCoreMsg = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(GetUsersInVoiceConfSysMsg.NAME, routing)
      val body = GetUsersInVoiceConfSysMsgBody(props.voiceProp.voiceConf)
      val header = BbbCoreHeaderWithMeetingId(GetUsersInVoiceConfSysMsg.NAME, meetingId)
      val event = GetUsersInVoiceConfSysMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val event = buildGetUsersInVoiceConfSysMsg(props.meetingProp.intId)
    outGW.send(event)
  }

  def sendBreakoutRoomCreatedToParent(
    props:    DefaultProps,
    eventBus: IncomingEventBus
  ): Unit = {
    //    eventBus.publish(BigBlueButtonEvent(
    //      props.breakoutProps.parentId,
    //      BreakoutRoomCreated(props.breakoutProps.parentId, props.meetingProp.intId)
    //    ))
  }

}
