package org.bigbluebutton

import akka.actor.ActorSystem
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import org.bigbluebutton.api.authorization.ConnectionCheckAuthorizationController
import org.bigbluebutton.api.create.CreateController
import org.bigbluebutton.api.enter.EnterController
import org.bigbluebutton.api.join.JoinController
import org.bigbluebutton.api.signOut.SignOutController
import org.bigbluebutton.api.stuns.StunsController
import scala.concurrent.ExecutionContext

object Server {

  val route: Route = pathPrefix("api") {
    CreateController.route ~
    JoinController.route ~
    EnterController.route ~
    SignOutController.route ~
    StunsController.route ~
    ConnectionCheckAuthorizationController.route
  }

  def main(args: Array[String]): Unit = {
    implicit val actorSystem: ActorSystem = ActorSystem()
    implicit val executionContext: ExecutionContext = actorSystem.dispatcher
    //implicit val actorMaterializer: ActorMaterializer = ActorMaterializer()
    Http().bindAndHandle(route, Settings.Http.host, Settings.Http.port)
  }
}
