package org.bigbluebutton.core.apps.webcam

import akka.actor.ActorContext
import akka.event.Logging

class WebcamApp2x(implicit val context: ActorContext)
  extends CamBroadcastStoppedInSfuEvtMsgHdlr
  with CamStreamSubscribedInSfuEvtMsgHdlr
  with CamStreamUnsubscribedInSfuEvtMsgHdlr
  with EjectUserCamerasCmdMsgHdlr
  with GetCamBroadcastPermissionReqMsgHdlr
  with GetCamSubscribePermissionReqMsgHdlr
  with GetWebcamsOnlyForModeratorReqMsgHdlr
  with SyncGetWebcamInfoRespMsgHdlr
  with UpdateWebcamsOnlyForModeratorCmdMsgHdlr
  with UserBroadcastCamStartMsgHdlr
  with UserBroadcastCamStopMsgHdlr {

  val log = Logging(context.system, getClass)
}
