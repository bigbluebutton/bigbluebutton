package org.bigbluebutton.endpoint.redis

import org.apache.pekko.actor.{Actor, ActorLogging, ActorSystem, Props}
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.{UserClosedAllGraphqlConnectionsInternalMsg, UserEstablishedGraphqlConnectionInternalMsg}
import org.bigbluebutton.core.bus.{BigBlueButtonEvent, InternalEventBus}
import org.bigbluebutton.core.db.UserGraphqlConnectionDAO

object GraphqlActionsActor {
  def props(system: ActorSystem,
            eventBus:       InternalEventBus,
           ): Props =
    Props(
      classOf[GraphqlActionsActor],
      system,
      eventBus,
    )
}

case class GraphqlUser(
               intId:              String,
               meetingId:          String,
               sessionToken:       String,
               )

case class GraphqlUserConnection(
                 browserConnectionId: String,
                 sessionToken:        String,
                 user:                GraphqlUser,
               )


class GraphqlActionsActor(
    system:         ActorSystem,
    val eventBus:   InternalEventBus,
) extends Actor with ActorLogging {

  private var users: Map[String, GraphqlUser] = Map()
  private var graphqlConnections: Map[String, GraphqlUserConnection] = Map()

  def receive = {
    //=============================
    // 2x messages
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)
    case _                        => // do nothing
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      // Messages from bbb-graphql-middleware
      case m: RegisterUserReqMsg                 => handleUserRegisteredRespMsg(m)
      case m: UserGraphqlConnectionEstablishedSysMsg       => handleUserGraphqlConnectionEstablishedSysMsg(m)
      case m: UserGraphqlConnectionClosedSysMsg       => handleUserGraphqlConnectionClosedSysMsg(m)
      case _                          => // message not to be handled.
    }
  }

  private def handleUserRegisteredRespMsg(msg: RegisterUserReqMsg): Unit = {
    users += (msg.body.sessionToken -> GraphqlUser(
      msg.body.intUserId,
      msg.body.meetingId,
      msg.body.sessionToken
    ))
  }

  private def handleUserGraphqlConnectionEstablishedSysMsg(msg: UserGraphqlConnectionEstablishedSysMsg): Unit = {
    UserGraphqlConnectionDAO.insert(msg.body.sessionToken, msg.body.browserConnectionId)

    for {
      user <- users.get(msg.body.sessionToken)
    } yield {

      //Send internal message informing user has connected
      if (!graphqlConnections.values.exists(c => c.sessionToken == msg.body.sessionToken)) {
        eventBus.publish(BigBlueButtonEvent(user.meetingId, UserEstablishedGraphqlConnectionInternalMsg(user.intId)))
      }

      graphqlConnections += (msg.body.browserConnectionId -> GraphqlUserConnection(
        msg.body.browserConnectionId,
        msg.body.sessionToken,
        user
      ))
    }
  }

  private def handleUserGraphqlConnectionClosedSysMsg(msg: UserGraphqlConnectionClosedSysMsg): Unit = {
    UserGraphqlConnectionDAO.updateClosed(msg.body.sessionToken, msg.body.browserConnectionId)

    for {
      user <- users.get(msg.body.sessionToken)
    } yield {
      graphqlConnections = graphqlConnections.-(msg.body.browserConnectionId)

      //Send internal message informing user disconnected
      if (!graphqlConnections.values.exists(c => c.sessionToken == msg.body.sessionToken)) {
        eventBus.publish(BigBlueButtonEvent(user.meetingId, UserClosedAllGraphqlConnectionsInternalMsg(user.intId)))
      }
    }
  }

}
