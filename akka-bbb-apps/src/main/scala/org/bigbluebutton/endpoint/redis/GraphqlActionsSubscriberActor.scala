package org.bigbluebutton.endpoint.redis

import org.apache.pekko.actor.{Actor, ActorLogging, ActorSystem, Props}
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.db.UserGraphqlConnectionDAO

object GraphqlActionsActor {
  def props(system: ActorSystem): Props =
    Props(
      classOf[GraphqlActionsActor],
      system,
    )
}

class GraphqlActionsActor(
    system:         ActorSystem,
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
      case m: UserGraphqlConnectionEstablishedSysMsg       => handleUserGraphqlConnectionEstablishedSysMsg(m)
      case m: UserGraphqlConnectionClosedSysMsg       => handleUserGraphqlConnectionClosedSysMsg(m)
      case _                          => // message not to be handled.
    }
  }

  private def handleUserGraphqlConnectionEstablishedSysMsg(msg: UserGraphqlConnectionEstablishedSysMsg) {
    UserGraphqlConnectionDAO.insert(msg.body.sessionToken, msg.body.browserConnectionId)
  }

  private def handleUserGraphqlConnectionClosedSysMsg(msg: UserGraphqlConnectionClosedSysMsg) {
    UserGraphqlConnectionDAO.updateClosed(msg.body.sessionToken, msg.body.browserConnectionId)
  }

}
