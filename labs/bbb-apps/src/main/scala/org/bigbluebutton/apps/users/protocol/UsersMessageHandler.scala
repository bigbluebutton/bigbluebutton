package org.bigbluebutton.apps.users.protocol

import akka.actor.{ Actor, Props, ActorRef, ActorLogging }
import akka.event.LoggingAdapter
import akka.pattern.{ ask, pipe }

import org.bigbluebutton.endpoint.MessageHandlerActor
import org.bigbluebutton.apps.Session
import org.bigbluebutton.apps.users.messages.UserJoinRequest
import org.bigbluebutton.apps.users.messages.UserJoinResponse
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.apps.Util
import org.bigbluebutton.endpoint.InMsgNameConst
import org.bigbluebutton.apps.protocol.Header
import org.bigbluebutton.apps.users.messages.Result
import org.bigbluebutton.apps.users.messages.UserJoinResponse
import org.bigbluebutton.apps.protocol.Destination
import org.bigbluebutton.endpoint.InMsgNameConst
import org.bigbluebutton.endpoint.UserJoinResponseMessage
import org.bigbluebutton.endpoint.UserJoinRequestFormat

trait UsersMessageHandler extends SystemConfiguration {
  this: MessageHandlerActor =>

  val bbbAppsActor: ActorRef
  val messageMarshallingActor: ActorRef
  val log: LoggingAdapter

  def handleUserJoinRequestMessage(msg: UserJoinRequestFormat) = {
    val session = Session(msg.payload.session, msg.payload.meeting)
    val replyDestination = msg.header.reply

    replyDestination foreach { replyTo =>
      val header = Header(Destination(replyTo.to, Some(replyTo.correlation_id)),
        InMsgNameConst.UserJoinResponse,
        Util.generateTimestamp, apiSourceName, None)

      val userJoinRequest = UserJoinRequest(session, msg.payload.token)
      val response = (bbbAppsActor ? userJoinRequest)
        .mapTo[UserJoinResponse]
        .map(response => {
          UserJoinResponseMessage(header, response)
        })
        .recover {
          case _ =>
            val result = Result(false, "Timeout waiting for response.")
            val response = UserJoinResponse(session, result, None)
            UserJoinResponseMessage(header, response)
        }

      response pipeTo messageMarshallingActor
    }
  }
}