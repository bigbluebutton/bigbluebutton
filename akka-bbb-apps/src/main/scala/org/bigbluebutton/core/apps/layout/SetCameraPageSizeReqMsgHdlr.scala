package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.ClientSettings.{ getConfigPropertyValueByPath, getConfigPropertyValueByPathAsBooleanOrElse, getConfigPropertyValueByPathAsIntOrElse }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.LayoutDAO
import org.bigbluebutton.core.models.Layouts
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait SetCameraPageSizeReqMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleSetCameraPageSizeReqMsg(msg: SetCameraPageSizeReqMsg): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId

    if (liveMeeting.props.meetingProp.disabledFeatures.contains("layoutView") ||
      !getConfigPropertyValueByPathAsBooleanOrElse(liveMeeting.clientSettings, "public.layout.layoutViewEnabled", true)) {
      val reason = "Layout view is disabled for this meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val reason = "No permission to set the camera page size."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val maxPageSize = getMaxCameraPageSize
      val cameraPageSize = msg.body.cameraPageSize

      if (cameraPageSize < 1 || cameraPageSize > maxPageSize) {
        log.warning(
          "Ignoring camera page size {} from user {} in meeting {}: outside 1..{}",
          cameraPageSize, msg.header.userId, meetingId, maxPageSize
        )
      } else {
        val changed = !Layouts.getCameraPageSize(liveMeeting.layouts).contains(cameraPageSize)
        Layouts.setCameraPageSize(liveMeeting.layouts, Some(cameraPageSize))
        LayoutDAO.insertOrUpdate(meetingId, liveMeeting.layouts)
        sendSetCameraPageSizeEvtMsg(msg.header.userId)
        if (changed) {
          LayoutHdlrHelpers.notifyLayoutUpdate(msg.header.userId, liveMeeting, outGW)
        }
      }
    }
  }

  // The largest value the client's slider can offer. With pagination thresholds on, that is the
  // size below the first threshold or a threshold's own size; clients cap the value per threshold.
  private def getMaxCameraPageSize: Int = {
    val settings = liveMeeting.clientSettings
    val thresholdsEnabled = getConfigPropertyValueByPathAsBooleanOrElse(settings, "public.kurento.paginationThresholds.enabled", false)
    val thresholds = getConfigPropertyValueByPath(settings, "public.kurento.paginationThresholds.thresholds") match {
      case Some(list: Seq[_]) => list.collect { case t: Map[String, Any] @unchecked => t }
      case _                  => Seq.empty
    }
    val users = thresholds.flatMap(t => intValue(t.get("users")))

    if (thresholdsEnabled && users.nonEmpty) {
      // An entry without desktop sizes keeps the configured ones, as in the client.
      val configuredViewerSize = intValue(getConfigPropertyValueByPath(settings, "public.kurento.pagination.desktopPageSizes.viewer"))
      val viewerSizes = thresholds.flatMap { t =>
        t.get("desktopPageSizes") match {
          case Some(sizes: Map[String, Any] @unchecked) => intValue(sizes.get("viewer"))
          case _                                        => configuredViewerSize
        }
      }
      math.max(1, ((users.min - 1) +: viewerSizes).max)
    } else {
      math.max(1, getConfigPropertyValueByPathAsIntOrElse(settings, "public.kurento.pagination.layoutViewMaxPageSize", 12))
    }
  }

  private def intValue(value: Option[Any]): Option[Int] = value match {
    case Some(n: Number) => Some(n.intValue)
    case _               => None
  }

  def sendSetCameraPageSizeEvtMsg(fromUserId: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, fromUserId)
    val envelope = BbbCoreEnvelope(SetCameraPageSizeEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(SetCameraPageSizeEvtMsg.NAME, liveMeeting.props.meetingProp.intId, fromUserId)
    val body = SetCameraPageSizeEvtMsgBody(Layouts.getCameraPageSize(liveMeeting.layouts).getOrElse(0), fromUserId)
    val event = SetCameraPageSizeEvtMsg(header, body)

    outGW.send(BbbCommonEnvCoreMsg(envelope, event))
  }
}
