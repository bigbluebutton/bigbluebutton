package org.bigbluebutton.endpoint.redis

import org.apache.pekko.actor.{Actor, ActorLogging, ActorSystem, Props}
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{UserClosedAllGraphqlConnectionsInternalMsg, UserEstablishedGraphqlConnectionInternalMsg}
import org.bigbluebutton.core.bus.{BigBlueButtonEvent, InternalEventBus}
import org.bigbluebutton.core.db.UserGraphqlConnectionDAO
import org.bigbluebutton.core2.message.senders.MsgBuilder
import java.time.Instant

import scala.concurrent.duration._
import org.apache.pekko.actor.Timers

case object MiddlewareHealthCheckScheduler10Sec

object GraphqlConnectionsActor {
  def props(system: ActorSystem,
            eventBus:       InternalEventBus,
            outGW:          OutMessageGateway,
           ): Props =
    Props(
      classOf[GraphqlConnectionsActor],
      system,
      eventBus,
      outGW,
    )
}

case class GraphqlUser(
               intId:              String,
               meetingId:          String,
               sessionToken:       String,
               )

case class GraphqlUserConnection(
                 middlewareUID:       String,
                 browserConnectionId: String,
                 sessionToken:        String,
                 clientSessionUUID:   String,
                 clientType:          String,
                 clientIsMobile:      Boolean,
                 user:                GraphqlUser,
               )

class GraphqlConnectionsActor(
    system:         ActorSystem,
    val eventBus:   InternalEventBus,
    val outGW:      OutMessageGateway,
) extends Actor with ActorLogging with Timers {

  private var users: Map[String, GraphqlUser] = Map()
  private var graphqlConnections: Map[String, GraphqlUserConnection] = Map()
  private var pendingResponseMiddlewareUIDs: Map[String, BigInt] = Map()

  override def preStart(): Unit = {
    timers.startTimerAtFixedRate("graphql-middleware-health-check", MiddlewareHealthCheckScheduler10Sec, 10.seconds)
  }

  private val maxMiddlewareInactivityInMillis = 11000

  def receive = {
    //=============================
    // 2x messages
    case msg: BbbCommonEnvCoreMsg             => handleBbbCommonEnvCoreMsg(msg)
    case MiddlewareHealthCheckScheduler10Sec  => runMiddlewareHealthCheck()
    case _                                    => // do nothing
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      case m: RegisterUserReqMsg                      => handleUserRegisteredRespMsg(m)
      case m: RegisterUserSessionTokenReqMsg          => handleRegisterUserSessionTokenReqMsg(m)
      case m: DestroyMeetingSysCmdMsg                 => handleDestroyMeetingSysCmdMsg(m)
      // Messages from bbb-graphql-middleware
      case m: UserGraphqlConnectionEstablishedSysMsg  => handleUserGraphqlConnectionEstablishedSysMsg(m)
      case m: UserGraphqlConnectionClosedSysMsg       => handleUserGraphqlConnectionClosedSysMsg(m)
      case m: CheckGraphqlMiddlewareAlivePongSysMsg   => handleCheckGraphqlMiddlewareAlivePongSysMsg(m)
      case _                                          => // message not to be handled.
    }
  }

  private def handleUserRegisteredRespMsg(msg: RegisterUserReqMsg): Unit = {
    users += (msg.body.sessionToken -> GraphqlUser(
      msg.body.intUserId,
      msg.body.meetingId,
      msg.body.sessionToken
    ))
  }

  private def handleRegisterUserSessionTokenReqMsg(msg: RegisterUserSessionTokenReqMsg): Unit = {
    users += (msg.body.sessionToken -> GraphqlUser(
      msg.body.userId,
      msg.body.meetingId,
      msg.body.sessionToken
    ))
  }

  private def handleDestroyMeetingSysCmdMsg(msg: DestroyMeetingSysCmdMsg): Unit = {
    users = users.filter(u => u._2.meetingId != msg.body.meetingId)
    graphqlConnections = graphqlConnections.filter(c => c._2.user.meetingId != msg.body.meetingId)
  }

  private def handleUserGraphqlConnectionEstablishedSysMsg(msg: UserGraphqlConnectionEstablishedSysMsg): Unit = {
    UserGraphqlConnectionDAO.insert(
      msg.body.sessionToken,
      msg.body.clientSessionUUID,
      msg.body.clientType,
      msg.body.clientIsMobile,
      msg.body.middlewareUID,
      msg.body.browserConnectionId)

    for {
      user <- users.get(msg.body.sessionToken)
    } yield {

      //Send internal message informing user has connected
        eventBus.publish(BigBlueButtonEvent(user.meetingId,
          UserEstablishedGraphqlConnectionInternalMsg(
            user.intId,
            msg.body.clientType,
            msg.body.clientIsMobile)
        ))

      graphqlConnections += (msg.body.browserConnectionId -> GraphqlUserConnection(
        msg.body.middlewareUID,
        msg.body.browserConnectionId,
        msg.body.sessionToken,
        msg.body.clientSessionUUID,
        msg.body.clientType,
        msg.body.clientIsMobile,
        user
      ))
    }
  }

  private def handleUserGraphqlConnectionClosedSysMsg(msg: UserGraphqlConnectionClosedSysMsg): Unit = {
    handleUserGraphqlConnectionClosed(msg.body.sessionToken, msg.body.middlewareUID, msg.body.browserConnectionId)
  }

  private def handleUserGraphqlConnectionClosed(sessionToken: String, middlewareUID: String, browserConnectionId: String): Unit = {
    UserGraphqlConnectionDAO.updateClosed(sessionToken, middlewareUID, browserConnectionId)

    for {
      user <- users.get(sessionToken)
    } yield {
      graphqlConnections = graphqlConnections.-(browserConnectionId)

      //Send internal message informing user disconnected
      if (!graphqlConnections.values.exists(c => c.sessionToken == sessionToken
        || (c.user.meetingId == user.meetingId && c.user.intId == user.intId))) {
        eventBus.publish(BigBlueButtonEvent(user.meetingId, UserClosedAllGraphqlConnectionsInternalMsg(user.intId)))
      }
    }
  }

  private def runMiddlewareHealthCheck(): Unit = {
    removeInactiveConnections()
    sendPingMessageToAllMiddlewareServices()
  }

  private def sendPingMessageToAllMiddlewareServices(): Unit = {
    graphqlConnections.map(c => {
      c._2.middlewareUID
    }).toVector.distinct.foreach(middlewareUID => {
      val event = MsgBuilder.buildCheckGraphqlMiddlewareAlivePingSysMsg(middlewareUID)
      outGW.send(event)
      log.debug("Sent ping message to graphql middleware {}.", middlewareUID)
      pendingResponseMiddlewareUIDs.get(middlewareUID) match {
        case None => pendingResponseMiddlewareUIDs += (middlewareUID -> System.currentTimeMillis)
        case Some(pingSentAt) => log.debug("There is already a pending response from middleware {} since {}.", middlewareUID, Instant.ofEpochMilli(pingSentAt.longValue))
      }
    })
  }

  private def removeInactiveConnections(): Unit = {
    for {
      (middlewareUid, pingSentAt) <- pendingResponseMiddlewareUIDs
      if (System.currentTimeMillis - pingSentAt) > maxMiddlewareInactivityInMillis
    } yield {
      log.info("Removing connections from the middleware {} due to inactivity of the service (waiting response since {}).",middlewareUid, Instant.ofEpochMilli(pingSentAt.longValue))
      for {
        (_, graphqlConn) <- graphqlConnections
        if graphqlConn.middlewareUID == middlewareUid
      } yield {
        handleUserGraphqlConnectionClosed(graphqlConn.sessionToken, graphqlConn.middlewareUID, graphqlConn.browserConnectionId)
      }

      pendingResponseMiddlewareUIDs -= middlewareUid
    }
  }

  private def handleCheckGraphqlMiddlewareAlivePongSysMsg(msg: CheckGraphqlMiddlewareAlivePongSysMsg): Unit = {
    log.debug("Received pong message from graphql middleware {}.",msg.body.middlewareUID)
    pendingResponseMiddlewareUIDs -= msg.body.middlewareUID
  }

}
