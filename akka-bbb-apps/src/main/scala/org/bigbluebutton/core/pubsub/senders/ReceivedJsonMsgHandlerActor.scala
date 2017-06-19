package org.bigbluebutton.core.pubsub.senders

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.SystemConfiguration
import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.messages.breakoutrooms._
import org.bigbluebutton.common2.messages.voiceconf._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core2.ReceivedMessageRouter

object ReceivedJsonMsgHandlerActor {
  def props(eventBus: BbbMsgRouterEventBus, incomingJsonMessageBus: IncomingJsonMessageBus): Props =
    Props(classOf[ReceivedJsonMsgHandlerActor], eventBus, incomingJsonMessageBus)
}

class ReceivedJsonMsgHandlerActor(
  val eventBus: BbbMsgRouterEventBus,
  val incomingJsonMessageBus: IncomingJsonMessageBus)
    extends Actor with ActorLogging
    with SystemConfiguration
    with ReceivedJsonMsgDeserializer
    with ReceivedMessageRouter {

  def receive = {
    case msg: ReceivedJsonMessage =>
      log.debug("handling {} - {}", msg.channel, msg.data)
      handleReceivedJsonMessage(msg)
    case _ => // do nothing
  }

  def handleReceivedJsonMessage(msg: ReceivedJsonMessage): Unit = {
    for {
      envJsonNode <- JsonDeserializer.toBbbCommonEnvJsNodeMsg(msg.data)
    } yield handle(envJsonNode.envelope, envJsonNode.core)
  }

  def send(channel: String, envelope: BbbCoreEnvelope, msg: BbbCoreMsg): Unit = {
    val event = BbbMsgEvent(channel, BbbCommonEnvCoreMsg(envelope, msg))
    publish(event)
  }

  def handle(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    log.debug("Route envelope name " + envelope.name)
    envelope.name match {
      case CreateMeetingReqMsg.NAME =>
        for {
          m <- deserialize[CreateMeetingReqMsg](jsonNode)
        } yield {
          send(meetingManagerChannel, envelope, m)
        }
      case ValidateAuthTokenReqMsg.NAME =>
        for {
          m <- deserialize[ValidateAuthTokenReqMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case RegisterUserReqMsg.NAME =>
        for {
          m <- deserialize[RegisterUserReqMsg](jsonNode)
        } yield {
          // Route via meeting manager as there is a race condition if we send directly to meeting
          // because the meeting actor might not have been created yet.
          send(meetingManagerChannel, envelope, m)
        }
      case UserJoinMeetingReqMsg.NAME =>
        for {
          m <- deserialize[UserJoinMeetingReqMsg](jsonNode)
        } yield {
          send(m.header.userId, envelope, m)
        }
      case UserBroadcastCamStartMsg.NAME =>
        for {
          m <- deserialize[UserBroadcastCamStartMsg](jsonNode)
        } yield {
          val event = BbbMsgEvent(m.header.meetingId, BbbCommonEnvCoreMsg(envelope, m))
          publish(event)
        }
      case UserBroadcastCamStopMsg.NAME =>
        for {
          m <- deserialize[UserBroadcastCamStopMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case RecordingStartedVoiceConfEvtMsg.NAME =>
        for {
          m <- deserialize[RecordingStartedVoiceConfEvtMsg](jsonNode)
        } yield {
          send(m.header.voiceConf, envelope, m)
        }
      case UserJoinedVoiceConfEvtMsg.NAME =>
        for {
          m <- deserialize[UserJoinedVoiceConfEvtMsg](jsonNode)
        } yield {
          send(m.header.voiceConf, envelope, m)
        }
      case UserLeftVoiceConfEvtMsg.NAME =>
        for {
          m <- deserialize[UserLeftVoiceConfEvtMsg](jsonNode)
        } yield {
          send(m.header.voiceConf, envelope, m)
        }
      case UserMutedInVoiceConfEvtMsg.NAME =>
        for {
          m <- deserialize[UserMutedInVoiceConfEvtMsg](jsonNode)
        } yield {
          send(m.header.voiceConf, envelope, m)
        }
      case UserTalkingInVoiceConfEvtMsg.NAME =>
        for {
          m <- deserialize[UserTalkingInVoiceConfEvtMsg](jsonNode)
        } yield {
          send(m.header.voiceConf, envelope, m)
        }
      case BreakoutRoomsListMsg.NAME =>
        for {
          m <- deserialize[BreakoutRoomsListMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case CreateBreakoutRoomsMsg.NAME =>
        for {
          m <- deserialize[CreateBreakoutRoomsMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case RequestBreakoutJoinURLMsg.NAME =>
        for {
          m <- deserialize[RequestBreakoutJoinURLMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case BreakoutRoomCreatedMsg.NAME =>
        for {
          m <- deserialize[BreakoutRoomCreatedMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case BreakoutRoomUsersUpdateMsg.NAME =>
        for {
          m <- deserialize[BreakoutRoomUsersUpdateMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case SendBreakoutUsersUpdateMsg.NAME =>
        for {
          m <- deserialize[SendBreakoutUsersUpdateMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case EndAllBreakoutRoomsMsg.NAME =>
        for {
          m <- deserialize[EndAllBreakoutRoomsMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case BreakoutRoomEndedMsg.NAME =>
        for {
          m <- deserialize[BreakoutRoomEndedMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case TransferUserToMeetingRequestMsg.NAME =>
        for {
          m <- deserialize[TransferUserToMeetingRequestMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case _ =>
        log.error("Cannot route envelope name " + envelope.name)
      // do nothing
    }
  }

}
