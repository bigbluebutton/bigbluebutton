package org.bigbluebutton

import akka.http.scaladsl.model._
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.server.Directives._
import org.bigbluebutton.service.{ HealthzService, PubSubReceiveStatus, PubSubSendStatus, RecordingDBSendStatus }
import spray.json.DefaultJsonProtocol

case class HealthResponse(
    isHealthy:           Boolean,
    pubsubSendStatus:    PubSubSendStatus,
    pubsubReceiveStatus: PubSubReceiveStatus,
    recordingDbStatus:   RecordingDBSendStatus
)

trait JsonSupportProtocol extends SprayJsonSupport with DefaultJsonProtocol {
  implicit val pubSubSendStatusJsonFormat = jsonFormat2(PubSubSendStatus)
  implicit val pubSubReceiveStatusJsonFormat = jsonFormat2(PubSubReceiveStatus)
  implicit val recordingDbStatusJsonFormat = jsonFormat2(RecordingDBSendStatus)
  implicit val healthServiceJsonFormat = jsonFormat4(HealthResponse)
}

class ApiService(healthz: HealthzService) extends JsonSupportProtocol {

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
    }
}
