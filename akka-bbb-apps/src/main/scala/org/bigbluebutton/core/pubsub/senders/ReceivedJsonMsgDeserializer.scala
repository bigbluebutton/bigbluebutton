package org.bigbluebutton.core.pubsub.senders

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.messages.voiceconf._
import org.bigbluebutton.core.bus.BbbMsgEvent

trait ReceivedJsonMsgDeserializer extends SystemConfiguration {
  this: ReceivedJsonMsgHandlerActor =>

  object JsonDeserializer extends Deserializer

  def routeCreateMeetingReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[CreateMeetingReqMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[CreateMeetingReqMsg](jsonNode)
      result match {
        case Some(msg) => Some(msg.asInstanceOf[CreateMeetingReqMsg])
        case None =>
          log.error("Failed to deserialize message. error: {} \n msg: ", error, jsonNode)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: CreateMeetingReqMsg): Unit = {
      val event = BbbMsgEvent(meetingManagerChannel, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def routeValidateAuthTokenReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[ValidateAuthTokenReqMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[ValidateAuthTokenReqMsg](jsonNode)

      result match {
        case Some(msg) => Some(msg.asInstanceOf[ValidateAuthTokenReqMsg])
        case None =>
          log.error("Failed to deserialize message. error: {} \n msg: ", error, jsonNode)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: ValidateAuthTokenReqMsg): Unit = {
      val event = BbbMsgEvent(msg.header.meetingId, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def routeRegisterUserReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[RegisterUserReqMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[RegisterUserReqMsg](jsonNode)

      result match {
        case Some(msg) =>
          Some(msg.asInstanceOf[RegisterUserReqMsg])
        case None =>
          log.error("Failed to deserialize message. error: {} \n msg: ", error, jsonNode)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: RegisterUserReqMsg): Unit = {
      // Route via meeting manager as there is a race condition if we send directly to meeting
      // because the meeting actor might not have been created yet.
      val event = BbbMsgEvent(meetingManagerChannel, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def routeUserJoinMeetingReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[UserJoinMeetingReqMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[UserJoinMeetingReqMsg](jsonNode)

      result match {
        case Some(msg) =>
          Some(msg.asInstanceOf[UserJoinMeetingReqMsg])
        case None =>
          log.error("Failed to deserialize message. error: {} \n msg: ", error, jsonNode)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: UserJoinMeetingReqMsg): Unit = {
      // Route via meeting manager as there is a race condition if we send directly to meeting
      // because the meeting actor might not have been created yet.
      val event = BbbMsgEvent(msg.header.userId, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def routeUserBroadcastCamStartMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[UserBroadcastCamStartMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[UserBroadcastCamStartMsg](jsonNode)

      result match {
        case Some(msg) =>
          Some(msg.asInstanceOf[UserBroadcastCamStartMsg])
        case None =>
          log.error("Failed to deserialize message. error: {} \n msg: ", error, jsonNode)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: UserBroadcastCamStartMsg): Unit = {
      val event = BbbMsgEvent(msg.header.meetingId, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def routeUserBroadcastCamStopMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[UserBroadcastCamStopMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[UserBroadcastCamStopMsg](jsonNode)

      result match {
        case Some(msg) =>
          Some(msg.asInstanceOf[UserBroadcastCamStopMsg])
        case None =>
          log.error("Failed to deserialize message. error: {} \n msg: ", error, jsonNode)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: UserBroadcastCamStopMsg): Unit = {
      val event = BbbMsgEvent(msg.header.meetingId, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def routeRecordingStartedVoiceConfEvtMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[RecordingStartedVoiceConfEvtMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[RecordingStartedVoiceConfEvtMsg](jsonNode)

      result match {
        case Some(msg) =>
          Some(msg.asInstanceOf[RecordingStartedVoiceConfEvtMsg])
        case None =>
          log.error("Failed to deserialize message. error: {} \n msg: ", error, jsonNode)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: RecordingStartedVoiceConfEvtMsg): Unit = {
      val event = BbbMsgEvent(msg.header.voiceConf, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def routeUserJoinedVoiceConfEvtMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[UserJoinedVoiceConfEvtMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[UserJoinedVoiceConfEvtMsg](jsonNode)

      result match {
        case Some(msg) =>
          Some(msg.asInstanceOf[UserJoinedVoiceConfEvtMsg])
        case None =>
          log.error("Failed to deserialize message. error: {} \n msg: ", error, jsonNode)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: UserJoinedVoiceConfEvtMsg): Unit = {
      val event = BbbMsgEvent(msg.header.voiceConf, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def routeUserLeftVoiceConfEvtMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[UserLeftVoiceConfEvtMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[UserLeftVoiceConfEvtMsg](jsonNode)

      result match {
        case Some(msg) =>
          Some(msg.asInstanceOf[UserLeftVoiceConfEvtMsg])
        case None =>
          log.error("Failed to deserialize message. error: {} \n msg: ", error, jsonNode)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: UserLeftVoiceConfEvtMsg): Unit = {
      val event = BbbMsgEvent(msg.header.voiceConf, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def routeUserMutedInVoiceConfEvtMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[UserMutedInVoiceConfEvtMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[UserMutedInVoiceConfEvtMsg](jsonNode)

      result match {
        case Some(msg) =>
          Some(msg.asInstanceOf[UserMutedInVoiceConfEvtMsg])
        case None =>
          log.error("Failed to deserialize message. error: {} \n msg: ", error, jsonNode)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: UserMutedInVoiceConfEvtMsg): Unit = {
      val event = BbbMsgEvent(msg.header.voiceConf, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def routeUserTalkingInVoiceConfEvtMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[UserTalkingInVoiceConfEvtMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[UserTalkingInVoiceConfEvtMsg](jsonNode)

      result match {
        case Some(msg) =>
          Some(msg.asInstanceOf[UserTalkingInVoiceConfEvtMsg])
        case None =>
          log.error("Failed to deserialize message. error: {} \n msg: ", error, jsonNode)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: UserTalkingInVoiceConfEvtMsg): Unit = {
      val event = BbbMsgEvent(msg.header.voiceConf, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }
}
