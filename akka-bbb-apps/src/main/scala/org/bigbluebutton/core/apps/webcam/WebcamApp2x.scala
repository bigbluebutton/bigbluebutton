package org.bigbluebutton.core.apps.webcam

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging

class WebcamApp2x(implicit val context: ActorContext)
  extends CamBroadcastStoppedInSfuEvtMsgHdlr
  with CamStreamSubscribedInSfuEvtMsgHdlr
  with CamStreamUnsubscribedInSfuEvtMsgHdlr
  with EjectUserCamerasCmdMsgHdlr
  with GetCamBroadcastPermissionReqMsgHdlr
  with GetCamSubscribePermissionReqMsgHdlr
  with GetWebcamsOnlyForModeratorReqMsgHdlr
  with UpdateWebcamsOnlyForModeratorCmdMsgHdlr
  with UserBroadcastCamStartMsgHdlr
  with UserBroadcastCamStopMsgHdlr
  with SetCamShowAsContentReqMsgHdlr {

  val log = Logging(context.system, getClass)
}
