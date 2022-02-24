package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.running.{ LiveMeeting }
import org.bigbluebutton.core.models.{ Users2x, Webcams, WebcamStream }
import org.bigbluebutton.LockSettingsUtil

object CameraHdlrHelpers extends SystemConfiguration {
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

  def hasReachedCameraCap(
      liveMeeting: LiveMeeting,
      userId:      String
  ): Boolean = {
    val cameras = Webcams.findWebcamsForUser(liveMeeting.webcams, userId).length

    liveMeeting.props.usersProp.userCameraCap match {
      case 0                => false // disabled
      case x if x > cameras => false
      case _                => true
    }
  }
}
