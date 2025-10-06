package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.common2.msgs.{BbbClientMsgHeader, BbbCommonEnvCoreMsg, BbbCoreEnvelope, MessageTypes, Routing, SetScreenshareAsContentEvtMsg, SetScreenshareAsContentEvtMsgBody}
import org.bigbluebutton.core.models.Layouts
import org.bigbluebutton.core.running.{LiveMeeting, OutMsgRouter}

object ScreenshareAsContenthdlrHelper {

  def sendSetScreenshareAsContentEvtMsg(
   fromUserId: String,
   liveMeeting:       LiveMeeting,
   outGW:             OutMsgRouter,
  ): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, fromUserId)
    val envelope = BbbCoreEnvelope(SetScreenshareAsContentEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(SetScreenshareAsContentEvtMsg.NAME, liveMeeting.props.meetingProp.intId, fromUserId)

    val body = SetScreenshareAsContentEvtMsgBody(
      Layouts.getScreenshareAsContent(liveMeeting.layouts),
    )
    val event = SetScreenshareAsContentEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    outGW.send(msgEvent)
  }

}
