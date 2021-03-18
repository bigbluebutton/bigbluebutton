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
            webcam: Webcam, audio: Audio, screenshare: Screenshare, users: List[String], presentation: Presentation,
            breakoutRoom: BreakoutRoom): MeetingInfoAnalytics =
    new MeetingInfoAnalytics(meetingName, meetingExternalId, meetingInternalId, hasUserJoined,
      isRecording, numberOfVideos, numberOfVoiceUsers, webcam, audio, screenshare, users, presentation, breakoutRoom)
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
    presentation:       Presentation,
    breakoutRoom:       BreakoutRoom
)

case class Webcam(totalWebcams: Int, webcamDetails: WebcamDetail)
case class WebcamDetail(broadcastId: String, viewers: List[String])

case class Audio(totalVoiceUsers: Int, totalListenOnlyUsers: Int, listeners: List[String])

case class Screenshare(name: String)

case class Presentation(id: String, name: String)
case class BreakoutRoom(parentId: String, rooms: List[String])
// number of webcam streams and viewers {total: 123, [{broadcast, viewers:[]}]}
// audio streams listeners and two ways
// screenshare
// users
// current presentation id and name
// breakout rooms id and name

