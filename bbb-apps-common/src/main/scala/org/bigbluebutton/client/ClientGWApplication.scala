package org.bigbluebutton.client

import akka.actor.ActorSystem
import org.bigbluebutton.red5.client.messaging.IConnectionInvokerService

import scala.concurrent.duration._

class ClientGWApplication(val connectionInvokerGW: IConnectionInvokerService) {

  implicit val system = ActorSystem("bbb-apps-common")
  implicit val timeout = akka.util.Timeout(3 seconds)

  def shutdown(): Unit = {
    system.terminate()
  }

}
