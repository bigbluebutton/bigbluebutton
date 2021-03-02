package org.bigbluebutton

import akka.http.scaladsl.model._
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.server.Directives._
import org.bigbluebutton.service.HealthzService
import spray.json.DefaultJsonProtocol

case class HealthResponse(isHealthy: Boolean)

trait JsonSupportProtocol extends SprayJsonSupport with DefaultJsonProtocol {
  implicit val healthServiceJsonFormat = jsonFormat1(HealthResponse)
}

class ApiService(healthz: HealthzService) extends JsonSupportProtocol {

  def routes =
    path("healthz") {
      get {
        val future = healthz.getHealthz()
        onSuccess(future) {
          case response =>
            if (response.isHealthy) {
              complete(StatusCodes.OK, HealthResponse(response.isHealthy))
            } else {
              complete(StatusCodes.ServiceUnavailable, HealthResponse(response.isHealthy))
            }
        }
      }
    }
}
