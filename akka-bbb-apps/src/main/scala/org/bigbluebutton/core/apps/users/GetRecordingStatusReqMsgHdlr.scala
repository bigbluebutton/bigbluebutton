package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ Users2x, Roles }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

trait GetRecordingStatusReqMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGetRecordingStatusReqMsg(msg: GetRecordingStatusReqMsg) {

    def buildGetRecordingStatusRespMsg(
        meetingId:               String,
        userId:                  String,
        recorded:                Boolean,
        recording:               Boolean,
        recordFullDurationMedia: Boolean,
        recordUserAudio:         Boolean,
        recordUserCameras:       Boolean,
        recordUserScreenShare:   Boolean
    ): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(GetRecordingStatusRespMsg.NAME, routing)
      val body = GetRecordingStatusRespMsgBody(recorded, recording, recordFullDurationMedia, userId,
        recordUserAudio,
        recordUserCameras,
        recordUserScreenShare)
      val header = BbbClientMsgHeader(GetRecordingStatusRespMsg.NAME, meetingId, userId)
      val event = GetRecordingStatusRespMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    // `recordUserAudio`, `recordUserScreenShare`, and `recordUserCameras`
    // relate to media-specific recording consents for the user requesting the
    // recording status. If meeting recording is disabled by a combination of
    // any of `recorded`, `recording`, or `recordFullDurationMedia` flags, then
    // these user-specific flags will not be used.
    // Audio and screenshare variants are not fully implemented yet.
    val recordUserAudio = true
    val recordUserScreenShare = true

    val userOption = Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
    val recordVideoFromUserMetadata: Boolean = userOption
      .flatMap(_.userMetadata.get("bbb_record_video"))
      .map(_.toBoolean)
      .getOrElse(true)

    val globalRecordViewerVideoSetting: Boolean = liveMeeting.props.metadataProp.metadata
      .get("hack-record-viewer-video")
      .map(_.toBoolean)
      .getOrElse(true)
    val recordViewerVideoFromUserMetadata: Boolean = userOption.map { user =>
      // Moderators always have recording permission unless explicitly disabled via userdata
      if (user.role == Roles.MODERATOR_ROLE) {
        true
      } else {
        // For non-moderators, use globalRecordViewerVideoSetting
        globalRecordViewerVideoSetting
      }
    }.getOrElse(true)

    val recordUserCameras = recordVideoFromUserMetadata && recordViewerVideoFromUserMetadata
    val event = buildGetRecordingStatusRespMsg(
      liveMeeting.props.meetingProp.intId,
      msg.body.requestedBy,
      liveMeeting.props.recordProp.record,
      MeetingStatus2x.isRecording(liveMeeting.status),
      liveMeeting.props.recordProp.recordFullDurationMedia,
      recordUserAudio,
      recordUserCameras,
      recordUserScreenShare
    )

    outGW.send(event)
  }
}
