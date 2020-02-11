package org.bigbluebutton

import scala.concurrent.ExecutionContext
import akka.http.scaladsl.model._
import akka.actor.ActorSystem
import akka.http.scaladsl.server.Directives._
import akka.stream.Materializer
import com.google.gson.Gson
import org.bigbluebutton.service.{ HealthzResponse, HealthzService }
import scala.collection.JavaConverters._
import scala.collection.mutable
import scala.util.{ Failure, Success }

class ApiService(healthz: HealthzService)(implicit executor: ExecutionContext, as: ActorSystem, mat: Materializer) {

  def routes =
    path("healthz") {
      get {
        onSuccess(healthz.getHealthz()) {
          case res =>
            val gson = new Gson()
            val response = Map("status" -> res.toFS, "heartbeat" -> res.fromFS.asJava)
            complete(StatusCodes.OK, HttpEntity(ContentTypes.`application/json`, gson.toJson(response.asJava)))
          case _ =>
            complete(StatusCodes.ServiceUnavailable)
        }
      }
    }
}
