package org.bigbluebutton.common2.msgs

object MeetingInfoAnalyticsMessage { val NAME = "MeetingInfoAnalyticsMessage" }
case class MeetingInfoAnalyticsMessage(
    header: BbbCoreBaseHeader,
    body:   MeetingInfoAnalyticsMessageBody
) extends BbbCoreMsg
case class MeetingInfoAnalyticsMessageBody(meetingInfo: MeetingInfoAnalytics)

object MeetingInfoAnalytics {
  def apply(meetingName: String, meetingExternalId: String, meetingInternalId: String, hasUserJoined: Boolean,
            isRecording: Boolean, numberOfVideos: Int, numberOfUsers: Int, numberOfVoiceUsers: Int,
            webcam: Webcam, audio: Audio, screenshare: Screenshare, users: List[String], presentationInfo: PresentationInfo,
            breakoutRoom: BreakoutRoom): MeetingInfoAnalytics =
    new MeetingInfoAnalytics(meetingName, meetingExternalId, meetingInternalId, hasUserJoined, isRecording,
      numberOfVideos, numberOfVoiceUsers, webcam, audio, screenshare, users, presentationInfo, breakoutRoom)
}

case class MeetingInfoAnalytics(
    meetingName:        String,
    meetingExternalId:  String,
    meetingInternalId:  String,
    hasUserJoined:      Boolean,
    isRecording:        Boolean,
    numberOfVideos:     Int,
    numberOfVoiceUsers: Int,
    webcam:             Webcam,
    audio:              Audio,
    screenshare:        Screenshare,
    users:              List[String],
    presentationInfo:   PresentationInfo,
    breakoutRoom:       BreakoutRoom
)

case class Webcam(totalWebcams: Int, webcamDetails: WebcamDetail)
case class WebcamDetail(broadcastId: String, viewers: List[String])

case class Audio(totalVoiceUsers: Int, totalListenOnlyUsers: Int, listeners: List[String])

case class Screenshare(name: String)

case class PresentationInfo(id: String, name: String, presenter: String)
case class BreakoutRoom(parentId: String, rooms: List[String])

