package org.bigbluebutton.endpoint.redis

import org.apache.pekko.actor.{Actor, ActorLogging, ActorSystem, Props}
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.db.UserGraphqlConnectionDAO
import scala.concurrent._


object GraphqlActionsActor {
  def props(
             system:         ActorSystem,
             outGW:          OutMessageGateway,
  ): Props =
    Props(
      classOf[GraphqlActionsActor],
      system,
      outGW
    )
}

class GraphqlActionsActor(
    system:         ActorSystem,
    val outGW:          OutMessageGateway,
) extends Actor with ActorLogging {

  def receive = {
    //=============================
    // 2x messages
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)
    case _                        => // do nothing
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      // Messages from bbb-graphql-middleware
      case m: UserGraphqlConnectionStablishedSysMsg       => handleUserGraphqlConnectionStablishedSysMsg(m)
      case m: UserGraphqlConnectionClosedSysMsg       => handleUserGraphqlConnectionClosedSysMsg(m)

      case _                          => {
        println("Other msg received!!!!------------------")
      }// message not to be handled.
    }
  }

  private def handleUserGraphqlConnectionStablishedSysMsg(msg: UserGraphqlConnectionStablishedSysMsg) {
    println("handleUserGraphqlConnectionStablishedSysMsg--------------------")
    UserGraphqlConnectionDAO.insert(msg.body.sessionToken, msg.body.browserConnectionId)
  }

  private def handleUserGraphqlConnectionClosedSysMsg(msg: UserGraphqlConnectionClosedSysMsg) {
    println("handleUserGraphqlConnectionClosedSysMsg------------------------")
    UserGraphqlConnectionDAO.updateClosed(msg.body.sessionToken, msg.body.browserConnectionId)
  }

}
