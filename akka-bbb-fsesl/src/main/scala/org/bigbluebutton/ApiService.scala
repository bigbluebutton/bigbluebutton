package org.bigbluebutton

import scala.concurrent.ExecutionContext
import akka.http.scaladsl.model._
import akka.actor.ActorSystem
import akka.http.scaladsl.server.Directives._
import akka.pattern.AskTimeoutException
import akka.stream.Materializer
import com.google.gson.Gson
import org.bigbluebutton.service.{ GetHealthResponseMessage, HealthzService }

import scala.collection.JavaConverters._
import scala.collection.mutable
import scala.util.{ Failure, Success }

class ApiService(healthz: HealthzService)(implicit executor: ExecutionContext, as: ActorSystem, mat: Materializer) {

  def routes =
    path("healthz") {
      get {
        val future = healthz.getHealthz()
        onSuccess(future) {
          case res =>
            if (res.isHealthy) {
              val gson = new Gson
              complete(StatusCodes.OK, HttpEntity(ContentTypes.`application/json`, gson.toJson(res)))
            } else {
              val gson = new Gson
              complete(StatusCodes.ServiceUnavailable, HttpEntity(ContentTypes.`application/json`, gson.toJson(res)))
            }
        }
      }
    } ~
      path("status") {
        get {
          val future = healthz.getFreeswitchStatus()
          onSuccess(future) {
            case res =>
              val gson = new Gson()
              val response = Map("status" -> res.status, "heartbeat" -> res.heartbeat.asJava)
              complete(StatusCodes.OK, HttpEntity(ContentTypes.`application/json`, gson.toJson(response.asJava)))
          }
        }
      }
}
