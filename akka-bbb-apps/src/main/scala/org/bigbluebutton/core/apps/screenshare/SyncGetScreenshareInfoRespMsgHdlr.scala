package org.bigbluebutton.core.apps.screenshare

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting

trait SyncGetScreenshareInfoRespMsgHdlr {
  this: ScreenshareApp2x =>

  def handleSyncGetScreenshareInfoRespMsg(liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val routing = Routing.addMsgToHtml5InstanceIdRouting(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.systemProps.html5InstanceId.toString
    )
    val envelope = BbbCoreEnvelope(SyncGetScreenshareInfoRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(
      SyncGetScreenshareInfoRespMsg.NAME,
      liveMeeting.props.meetingProp.intId,
      "nodeJSapp"
    )
    val body = SyncGetScreenshareInfoRespMsgBody(
      ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel),
      ScreenshareModel.getVoiceConf(liveMeeting.screenshareModel),
      ScreenshareModel.getScreenshareConf(liveMeeting.screenshareModel),
      ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel),
      ScreenshareModel.getScreenshareVideoWidth(liveMeeting.screenshareModel),
      ScreenshareModel.getScreenshareVideoHeight(liveMeeting.screenshareModel),
      ScreenshareModel.getTimestamp(liveMeeting.screenshareModel),
      ScreenshareModel.getHasAudio(liveMeeting.screenshareModel)
    )
    val event = SyncGetScreenshareInfoRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    bus.outGW.send(msgEvent)
  }
}
