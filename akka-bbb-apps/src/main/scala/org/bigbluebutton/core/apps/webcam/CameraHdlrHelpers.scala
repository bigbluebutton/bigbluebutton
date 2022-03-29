package org.bigbluebutton.core.apps.webcam

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.LockSettingsUtil
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.models.{ Users2x, Webcams, WebcamStream }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

object CameraHdlrHelpers extends SystemConfiguration with RightsManagementTrait {
  def isCameraBroadcastAllowed(
      liveMeeting: LiveMeeting,
      meetingId:   String,
      userId:      String,
      streamId:    String
  ): Boolean = {
    Users2x.findWithIntId(liveMeeting.users2x, userId) match {
      case Some(user) => {
        val camBroadcastLocked = LockSettingsUtil.isCameraBroadcastLocked(user, liveMeeting)
        val camCapReached = hasReachedCameraCap(liveMeeting, userId)

        (applyPermissionCheck &&
          !camBroadcastLocked &&
          !camCapReached &&
          !user.userLeftFlag.left &&
          streamId.startsWith(user.intId) &&
          liveMeeting.props.meetingProp.intId == meetingId)
      }
      case _ => false
    }
  }

  def isCameraSubscribeAllowed(
      liveMeeting: LiveMeeting,
      meetingId:   String,
      userId:      String,
      stream:      WebcamStream
  ): Boolean = {
    Users2x.findWithIntId(liveMeeting.users2x, userId) match {
      case Some(user) => {
        val camSubscribeLocked = LockSettingsUtil.isCameraSubscribeLocked(user, stream, liveMeeting)

        (applyPermissionCheck &&
          !camSubscribeLocked &&
          !user.userLeftFlag.left &&
          liveMeeting.props.meetingProp.intId == meetingId)
      }
      case _ => false
    }
  }

  def isCameraSubscribeAllowed(
      liveMeeting: LiveMeeting,
      meetingId:   String,
      userId:      String,
      streamId:    String
  ): Boolean = {
    Webcams.findWithStreamId(liveMeeting.webcams, streamId) match {
      case Some(stream) => isCameraSubscribeAllowed(liveMeeting, meetingId, userId, stream)
      case _            => false
    }
  }

  def isCameraEjectAllowed(
      liveMeeting: LiveMeeting,
      userId:      String
  ): Boolean = {
    val allowModsToEjectCameras = liveMeeting.props.usersProp.allowModsToEjectCameras
    val isBreakout = liveMeeting.props.meetingProp.isBreakout
    val hasPermission = !permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL,
      liveMeeting.users2x,
      userId
    )

    (allowModsToEjectCameras &&
      !isBreakout &&
      hasPermission)
  }

  def isWebcamsOnlyForModeratorUpdateAllowed(
      liveMeeting: LiveMeeting,
      userId:      String
  ): Boolean = {
    val isBreakout = liveMeeting.props.meetingProp.isBreakout
    val hasPermission = !permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL,
      liveMeeting.users2x,
      userId
    )

    (!isBreakout && hasPermission)
  }

  def updateWebcamsOnlyForModerator(
      liveMeeting: LiveMeeting,
      value:       Boolean,
      outGW:       OutMsgRouter
  ): Option[Boolean] = {
    MeetingStatus2x.webcamsOnlyForModeratorEnabled(liveMeeting.status) match {
      case x if x != value => {
        MeetingStatus2x.setWebcamsOnlyForModerator(liveMeeting.status, value)
        LockSettingsUtil.enforceCamLockSettingsForAllUsers(liveMeeting, outGW)
        Some(value)
      }
      case _ => None
    }
  }

  def hasReachedCameraCap(
      liveMeeting: LiveMeeting,
      userId:      String
  ): Boolean = {
    val cameras = Webcams.findAll(liveMeeting.webcams).length
    val meetingCap = liveMeeting.props.meetingProp.meetingCameraCap match {
      case 0                => false // disabled
      case x if x > cameras => false
      case _                => true
    }

    val userCameras = Webcams.findWebcamsForUser(liveMeeting.webcams, userId).length
    val userCap = liveMeeting.props.usersProp.userCameraCap match {
      case 0                    => false // disabled
      case x if x > userCameras => false
      case _                    => true
    }

    (meetingCap || userCap)
  }

  def stopBroadcastedCam(
      liveMeeting: LiveMeeting,
      meetingId:   String,
      userId:      String,
      streamId:    String,
      outGW:       OutMsgRouter
  ): Unit = {

    def broadcastEvent(meetingId: String, userId: String, streamId: String) {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(UserBroadcastCamStoppedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserBroadcastCamStoppedEvtMsg.NAME, meetingId, userId)
      val body = UserBroadcastCamStoppedEvtMsgBody(userId, streamId)
      val event = UserBroadcastCamStoppedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(msgEvent)
    }

    if (Webcams.hasWebcamStream(liveMeeting.webcams, streamId)) {
      if (Webcams.isPublisher(liveMeeting.webcams, userId, streamId)) {
        for {
          _ <- Webcams.removeWebcamStream(liveMeeting.webcams, streamId)
        } yield broadcastEvent(meetingId, userId, streamId)
      } else {
        val reason = "User does not own camera stream"
        PermissionCheck.ejectUserForFailedPermission(
          meetingId,
          userId,
          reason,
          outGW,
          liveMeeting
        )
      }
    }
  }

  def requestBroadcastedCamEjection(
      meetingId: String,
      userId:    String,
      streamId:  String,
      outGW:     OutMsgRouter
  ): Unit = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(CamBroadcastStopSysMsg.NAME, routing)
    val body = CamBroadcastStopSysMsgBody(meetingId, userId, streamId)
    val header = BbbCoreBaseHeader(CamBroadcastStopSysMsg.NAME)
    val event = CamBroadcastStopSysMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    outGW.send(msgEvent)
  }

  def requestCamSubscriptionEjection(
      meetingId: String,
      userId:    String,
      streamId:  String,
      outGW:     OutMsgRouter
  ): Unit = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(CamStreamUnsubscribeSysMsg.NAME, routing)
    val body = CamStreamUnsubscribeSysMsgBody(meetingId, userId, streamId)
    val header = BbbCoreBaseHeader(CamStreamUnsubscribeSysMsg.NAME)
    val event = CamStreamUnsubscribeSysMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    outGW.send(msgEvent)
  }
}
