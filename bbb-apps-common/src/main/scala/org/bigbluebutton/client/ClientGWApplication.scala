package org.bigbluebutton.client

import akka.actor.ActorSystem
import scala.concurrent.duration._

class ClientGWApplication {
  implicit val system = ActorSystem("bbb-apps-common")
  implicit val timeout = akka.util.Timeout(3 seconds)
}
