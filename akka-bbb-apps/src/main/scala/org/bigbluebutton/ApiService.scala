package org.bigbluebutton

import akka.http.scaladsl.model._
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.server.Directives._
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.service.{ HealthzService, MeetingInfoService, PubSubReceiveStatus, PubSubSendStatus, RecordingDBSendStatus }
import spray.json.DefaultJsonProtocol

case class HealthResponse(
    isHealthy:           Boolean,
    pubsubSendStatus:    PubSubSendStatus,
    pubsubReceiveStatus: PubSubReceiveStatus,
    recordingDbStatus:   RecordingDBSendStatus
)

case class MeetingInfoResponse(
    meetingInfoResponse: Option[MeetingInfoAnalytics]
)

case class MeetingInfoAnalytics(
    name:              String,
    externalId:        String,
    internalId:        String,
    hasUserJoined:     Boolean,
    isMeetingRecorded: Boolean,
    webcams:           Webcam,
    audio:             Audio,
    screenshare:       Screenshare,
    users:             List[Participant],
    presentation:      PresentationInfo,
    breakoutRoom:      BreakoutRoom
)

trait JsonSupportProtocolHealthResponse extends SprayJsonSupport with DefaultJsonProtocol {
  implicit val pubSubSendStatusJsonFormat = jsonFormat2(PubSubSendStatus)
  implicit val pubSubReceiveStatusJsonFormat = jsonFormat2(PubSubReceiveStatus)
  implicit val recordingDbStatusJsonFormat = jsonFormat2(RecordingDBSendStatus)
  implicit val healthServiceJsonFormat = jsonFormat4(HealthResponse)
}

trait JsonSupportProtocolMeetingInfoResponse extends SprayJsonSupport with DefaultJsonProtocol {
  implicit val meetingInfoUserJsonFormat = jsonFormat2(User)
  implicit val meetingInfoBroadcastJsonFormat = jsonFormat3(Broadcast)
  implicit val meetingInfoWebcamStreamJsonFormat = jsonFormat2(WebcamStream)
  implicit val meetingInfoWebcamJsonFormat = jsonFormat2(Webcam)

  implicit val meetingInfoListenOnlyAudioJsonFormat = jsonFormat2(ListenOnlyAudio)
  implicit val meetingInfoTwoWayAudioJsonFormat = jsonFormat2(TwoWayAudio)
  implicit val meetingInfoPhoneAudioJsonFormat = jsonFormat2(PhoneAudio)
  implicit val meetingInfoAudioJsonFormat = jsonFormat4(Audio)

  implicit val meetingInfoScreenshareStreamJsonFormat = jsonFormat2(ScreenshareStream)
  implicit val meetingInfoScreenshareJsonFormat = jsonFormat1(Screenshare)

  implicit val meetingInfoPresentationInfoJsonFormat = jsonFormat2(PresentationInfo)
  implicit val meetingInfoBreakoutRoomJsonFormat = jsonFormat2(BreakoutRoom)

  implicit val meetingInfoParticipantJsonFormat = jsonFormat3(Participant)
  implicit val meetingInfoAnalyticsJsonFormat = jsonFormat11(MeetingInfoAnalytics)
  implicit val meetingInfoResponseJsonFormat = jsonFormat1(MeetingInfoResponse)
}

class ApiService(healthz: HealthzService, meetingInfoz: MeetingInfoService)
  extends JsonSupportProtocolHealthResponse
  with JsonSupportProtocolMeetingInfoResponse {

  def routes =
    path("healthz") {
      get {
        val future = healthz.getHealthz()
        onSuccess(future) {
          case response =>
            if (response.isHealthy) {
              complete(
                StatusCodes.OK,
                HealthResponse(
                  response.isHealthy,
                  response.pubSubSendStatus,
                  response.pubSubReceiveStatus,
                  response.recordingDBSendStatus
                )
              )
            } else {
              complete(
                StatusCodes.ServiceUnavailable,
                HealthResponse(
                  response.isHealthy,
                  response.pubSubSendStatus,
                  response.pubSubReceiveStatus,
                  response.recordingDBSendStatus
                )
              )
            }
        }
      }
    } ~
      path("analytics") {
        get {
          val future = meetingInfoz.getAnalytics()
          onSuccess(future) {
            case response =>
              if (response.optionMeetingInfoAnalytics.isDefined) {
                complete(
                  StatusCodes.OK,
                  MeetingInfoResponse(response.optionMeetingInfoAnalytics)
                )
              } else {
                complete(
                  StatusCodes.NoContent,
                  MeetingInfoResponse(None)
                )
              }
          }
        }
      }
}
