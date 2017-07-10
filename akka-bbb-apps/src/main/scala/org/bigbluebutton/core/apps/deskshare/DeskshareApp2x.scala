package org.bigbluebutton.core.apps.deskshare

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.LiveMeeting

class DeskshareApp2x(val liveMeeting: LiveMeeting,
  val outGW: OutMessageGateway)(implicit val context: ActorContext)
    extends DeskshareStartedVoiceConfEvtMsgHdlr
    with DeskshareStoppedVoiceConfEvtMsgHdlr
    with DeskshareRtmpBroadcastStartedVoiceConfEvtMsgHdlr
    with DeskshareRtmpBroadcastStoppedVoiceConfEvtMsgHdlr {

  val log = Logging(context.system, getClass)

}
