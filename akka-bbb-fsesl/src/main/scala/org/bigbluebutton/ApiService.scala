package org.bigbluebutton

import scala.concurrent.ExecutionContext
import akka.http.scaladsl.model._
import akka.actor.ActorSystem
import akka.http.scaladsl.server.Directives._
import akka.stream.Materializer

class ApiService()(implicit executor: ExecutionContext, as: ActorSystem, mat: Materializer) {

  def routes =
    path("hello") {
      get {
        complete(HttpEntity(ContentTypes.`text/html(UTF-8)`, "<h1>Say hello to akka-http</h1>"))
      }
    } ~
      // Add a new route
      pathPrefix("healthz") {
        pathEndOrSingleSlash {
          get {
            complete {
              "Hello World!"
            }
          }
        }
      }
}
