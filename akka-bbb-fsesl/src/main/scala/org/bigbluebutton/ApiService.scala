package org.bigbluebutton

import scala.concurrent.ExecutionContext
import akka.http.scaladsl.model._
import akka.actor.ActorSystem
import akka.http.scaladsl.server.Directives._
import akka.stream.Materializer
import com.google.gson.Gson
import org.bigbluebutton.service.{HealthzResponse, HealthzService}

class ApiService(healthz: HealthzService)(implicit executor: ExecutionContext, as: ActorSystem, mat: Materializer) {

  def routes =
    path("healthz") {
      get {
        val resp = healthz.getHealthz()
        val gson = new Gson()
        val response = new HealthzResponse(resp, "fine")
        complete(StatusCodes.ServiceUnavailable, HttpEntity(ContentTypes.`application/json`, gson.toJson(response)))
      }
    }
}
