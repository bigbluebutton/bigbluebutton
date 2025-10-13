package org.bigbluebutton.core.apps.disabledcomponents

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.MeetingActor

trait ChangeDisabledFeaturesInMeetingCmdMsgHdlr extends RightsManagementTrait { this: MeetingActor =>

  private val allowedFeatures: Set[String] = Set(
    "breakoutRooms", "captions", "chat", "privateChat", "deleteChatMessage", "editChatMessage",
    "replyChatMessage", "chatMessageReactions", "downloadPresentationWithAnnotations",
    "downloadPresentationConvertedToPdf", "downloadPresentationOriginalFile",
    "snapshotOfCurrentSlide", "externalVideos", "importPresentationWithAnnotationsFromBreakoutRooms",
    "importSharedNotesFromBreakoutRooms", "layouts", "learningDashboard",
    "learningDashboardDownloadSessionData", "polls", "screenshare", "sharedNotes",
    "virtualBackgrounds", "customVirtualBackgrounds", "liveTranscription", "presentation",
    "cameraAsContent", "timer", "infiniteWhiteboard", "raiseHand", "userReactions",
    "chatEmojiPicker", "quizzes"
  )

  def handleChangeDisabledComponentsCmdMsg(msg: ChangeDisabledFeaturesInMeetingCmdMsg): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId
    val userId = msg.header.userId

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, userId) ||
      liveMeeting.props.meetingProp.isBreakout) {
      val reason = "No permission to change disabled components"
      PermissionCheck.ejectUserForFailedPermission(meetingId, userId, reason, outGW, liveMeeting)
      return
    }

    val requestedDisabled = msg.body.disabledFeatures
    val invalidComponents = requestedDisabled.filterNot(allowedFeatures.contains)

    if (invalidComponents.nonEmpty) {
      log.warning(
        "User {} attempted to disable invalid features {} in meeting {}",
        userId,
        invalidComponents.mkString(", "),
        meetingId
      )
      val reason = s"Invalid features: ${invalidComponents.mkString(", ")}"
      PermissionCheck.ejectUserForFailedPermission(meetingId, userId, reason, outGW, liveMeeting)
      return
    }

    val permanentlyDisabled = liveMeeting.props.meetingProp.disabledFeatures.toSet
    //  Not allow remove items disabled via parameter
    val newDisabled = requestedDisabled.toSet ++ permanentlyDisabled

    if (requestedDisabled.exists(f => permanentlyDisabled.contains(f))) {
      log.info("User {} attempted to modify permanently disabled features in meeting {} — ignored.", userId, meetingId)
    }

    DisabledFeatures2x.setAll(liveMeeting.disabledFeatures2x, newDisabled.toVector)
    DisabledFeatures2x.persist(meetingId, liveMeeting.disabledFeatures2x)

    log.info("Meeting {} updated disabled features: {}", meetingId, newDisabled.mkString(", "))
  }
}
