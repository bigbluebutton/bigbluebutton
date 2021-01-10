package org.bigbluebutton

import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives._
import org.bigbluebutton.service.{ HealthzService }
import spray.json.DefaultJsonProtocol
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport

case class HealthResponse(isHealthy: Boolean)
case class StatusResponse(status: Array[String], heartbeat: Map[String, String])

trait JsonSupport extends SprayJsonSupport with DefaultJsonProtocol {
  implicit val healthResponseFormat = jsonFormat1(HealthResponse)
  implicit val statusResponseFormat = jsonFormat2(StatusResponse)
}

class ApiService(healthz: HealthzService) extends JsonSupport {

  def routes =
    path("healthz") {
      get {
        val future = healthz.getHealthz()
        onSuccess(future) {
          case res =>
            if (res.isHealthy) {
              complete(StatusCodes.Created, HealthResponse(res.isHealthy))
            } else {
              complete(StatusCodes.ServiceUnavailable, HealthResponse(res.isHealthy))
            }
        }
      }
    } ~
      path("status") {
        get {
          val future = healthz.getFreeswitchStatus()
          onSuccess(future) {
            case res =>
              val response = StatusResponse(res.status, res.heartbeat)
              complete(StatusCodes.OK, response)
          }
        }
      }
}
