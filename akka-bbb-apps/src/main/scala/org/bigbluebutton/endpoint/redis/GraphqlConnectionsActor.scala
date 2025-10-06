package org.bigbluebutton.endpoint.redis

import org.apache.pekko.actor.{Actor, ActorLogging, Props, Timers}
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{UserClosedAllGraphqlConnectionsInternalMsg, UserEstablishedGraphqlConnectionInternalMsg}
import org.bigbluebutton.core.bus.{BigBlueButtonEvent, InternalEventBus}
import org.bigbluebutton.core.db.{UserConnectionStatusDAO, UserGraphqlConnectionDAO}
import org.bigbluebutton.core2.message.senders.MsgBuilder

import scala.concurrent.duration._
import java.time.Instant

/**
 * Health‑check logic
 * ------------------
 * • Ping every middleware every 5s (PingInterval).
 * • Each ping increments an attempt counter.
 * • A middleware is considered inactive when it reaches 3 attempts (≈15s) without any pong;
 *   the check happens at the beginning of the next cycle.
 */

case object MiddlewareHealthCheckScheduler5Sec

object GraphqlConnectionsActor {
  def props(
      eventBus: InternalEventBus,
      outGW:    OutMessageGateway
  ): Props =
    Props(classOf[GraphqlConnectionsActor], eventBus, outGW)
}

case class GraphqlUser(intId: String, meetingId: String, sessionToken: String)

case class GraphqlUserConnection(
    middlewareUID:       String,
    browserConnectionId: String,
    sessionToken:        String,
    clientSessionUUID:   String,
    clientType:          String,
    clientIsMobile:      Boolean,
    user:                GraphqlUser
)

private case class PendingPing(sentAt: Long, attempts: Int)

class GraphqlConnectionsActor(
    val eventBus: InternalEventBus,
    val outGW:    OutMessageGateway
)
  extends Actor with ActorLogging with Timers {

  /* ---------------- Mutable state ---------------- */
  private var users: Map[String, GraphqlUser] = Map.empty
  private var graphqlConnections: Map[String, GraphqlUserConnection] = Map.empty
  private var pending: Map[String, PendingPing] = Map.empty

  /* ---------------- Constants -------------------- */
  private val PingInterval = 5.seconds
  private val MaxAttempts = 3 // 3 pings ≈ 15s

  override def preStart(): Unit =
    timers.startTimerAtFixedRate(
      "graphql-middleware-health-check",
      MiddlewareHealthCheckScheduler5Sec, PingInterval
    )

  def receive: Receive = {
    case msg: BbbCommonEnvCoreMsg           => handleBbbCommonEnvCoreMsg(msg)
    case MiddlewareHealthCheckScheduler5Sec => runHealthCheck()
    case _                                  => // ignore
  }

  /* ---------------- Health‑check ----------------- */

  private def runHealthCheck(): Unit = {
    val now = System.currentTimeMillis()

    // 1) Check for time‑outs before sending new pings
    pending.foreach { case (mw, pp) =>
      val elapsed = now - pp.sentAt
      if (pp.attempts >= MaxAttempts && elapsed >= (MaxAttempts * PingInterval).toMillis) {
        markMiddlewareInactive(mw, pp)
      }
    }

    // 2) Send ping to every still‑active middleware
    val middlewares = graphqlConnections.values.map(_.middlewareUID).toSet
    middlewares.foreach(sendPing)
  }

  private def sendPing(middlewareUID: String): Unit = {
    val newPending = pending.get(middlewareUID) match {
      case Some(p) => p.copy(attempts = p.attempts + 1) // Re‑ping; keep original sentAt
      case None    => PendingPing(System.currentTimeMillis(), 1) // First ping
    }

    pending += (middlewareUID -> newPending)

    outGW.send(MsgBuilder.buildCheckGraphqlMiddlewareAlivePingSysMsg(middlewareUID))
    if (newPending.attempts > 1) {
      log.warning("Sent ping {} attempt #{}", middlewareUID, newPending.attempts)
    } else {
      log.debug("Sent ping {} attempt #{}", middlewareUID, newPending.attempts)
    }
  }

  private def markMiddlewareInactive(mw: String, status: PendingPing): Unit = {
    log.info(
      "Middleware {} considered INACTIVE after {} attempts (since {}).",
      mw, status.attempts, Instant.ofEpochMilli(status.sentAt)
    )

    // Close connections and emit events
    graphqlConnections.values
      .filter(_.middlewareUID == mw)
      .foreach { conn =>
        handleUserGraphqlConnectionClosed(conn.sessionToken, conn.middlewareUID, conn.browserConnectionId)
      }

    pending -= mw
  }

  /* ---------------- Pong response --------------- */

  private def handleCheckGraphqlMiddlewareAlivePongSysMsg(msg: CheckGraphqlMiddlewareAlivePongSysMsg): Unit = {
    pending.get(msg.body.middlewareUID).foreach { pp =>
      val rtt = System.currentTimeMillis() - pp.sentAt
      if (rtt > 1000) {
        log.warning("Received pong from {} after {}ms (attempt {}).", msg.body.middlewareUID, rtt, pp.attempts)
      } else {
        log.debug("Received pong from {} after {}ms (attempt {}).", msg.body.middlewareUID, rtt, pp.attempts)
      }
    }
    pending -= msg.body.middlewareUID
  }

  /* ----------- Core message handlers ------------ */

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = msg.core match {
    case m: RegisterUserReqMsg                     => handleUserRegisteredRespMsg(m)
    case m: RegisterUserSessionTokenReqMsg         => handleRegisterUserSessionTokenReqMsg(m)
    case m: DestroyMeetingSysCmdMsg                => handleDestroyMeetingSysCmdMsg(m)
    case m: UserGraphqlConnectionEstablishedSysMsg => handleUserGraphqlConnectionEstablishedSysMsg(m)
    case m: UserGraphqlConnectionClosedSysMsg      => handleUserGraphqlConnectionClosedSysMsg(m)
    case m: CheckGraphqlMiddlewareAlivePongSysMsg  => handleCheckGraphqlMiddlewareAlivePongSysMsg(m)
    case _                                         => // ignore
  }

  /* ----------- User / connection tracking ------- */

  private def handleUserRegisteredRespMsg(msg: RegisterUserReqMsg): Unit =
    users += (msg.body.sessionToken -> GraphqlUser(msg.body.intUserId, msg.body.meetingId, msg.body.sessionToken))

  private def handleRegisterUserSessionTokenReqMsg(msg: RegisterUserSessionTokenReqMsg): Unit =
    users += (msg.body.sessionToken -> GraphqlUser(msg.body.userId, msg.body.meetingId, msg.body.sessionToken))

  private def handleDestroyMeetingSysCmdMsg(msg: DestroyMeetingSysCmdMsg): Unit = {
    users = users.filterNot { case (_, u) => u.meetingId == msg.body.meetingId }
    graphqlConnections = graphqlConnections.filterNot { case (_, c) => c.user.meetingId == msg.body.meetingId }
  }

  private def handleUserGraphqlConnectionEstablishedSysMsg(msg: UserGraphqlConnectionEstablishedSysMsg): Unit = {
    UserGraphqlConnectionDAO.insert(
      msg.body.sessionToken,
      msg.body.clientSessionUUID,
      msg.body.clientType,
      msg.body.clientIsMobile,
      msg.body.middlewareUID,
      msg.body.browserConnectionId
    )

    users.get(msg.body.sessionToken).foreach { user =>
      eventBus.publish(BigBlueButtonEvent(
        user.meetingId,
        UserEstablishedGraphqlConnectionInternalMsg(user.intId, msg.body.clientType, msg.body.clientIsMobile)
      ))

      graphqlConnections += (msg.body.browserConnectionId ->
        GraphqlUserConnection(
          msg.body.middlewareUID,
          msg.body.browserConnectionId,
          msg.body.sessionToken,
          msg.body.clientSessionUUID,
          msg.body.clientType,
          msg.body.clientIsMobile,
          user
        ))

      UserConnectionStatusDAO.insert(
        user.meetingId,
        user.intId,
        msg.body.sessionToken,
        msg.body.clientSessionUUID,
      )
    }
  }

  private def handleUserGraphqlConnectionClosedSysMsg(msg: UserGraphqlConnectionClosedSysMsg): Unit =
    handleUserGraphqlConnectionClosed(msg.body.sessionToken, msg.body.middlewareUID, msg.body.browserConnectionId)

  private def handleUserGraphqlConnectionClosed(sessionToken: String, middlewareUID: String, browserConnectionId: String): Unit = {
    UserGraphqlConnectionDAO.updateClosed(sessionToken, middlewareUID, browserConnectionId)

    users.get(sessionToken).foreach { user =>
      graphqlConnections -= browserConnectionId

      val userStillConnected = graphqlConnections.values.exists { c =>
        c.sessionToken == sessionToken || (c.user.meetingId == user.meetingId && c.user.intId == user.intId)
      }

      if (!userStillConnected) {
        eventBus.publish(BigBlueButtonEvent(user.meetingId, UserClosedAllGraphqlConnectionsInternalMsg(user.intId)))
      }
    }
  }
}
