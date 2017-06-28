package org.bigbluebutton.freeswitch

import org.bigbluebutton.common2.msgs._

import com.fasterxml.jackson.databind.JsonNode

trait RxJsonMsgDeserializer {
  this: RxJsonMsgHdlrActor =>

  object JsonDeserializer extends Deserializer

  def routeEjectAllFromVoiceConfMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[EjectAllFromVoiceConfMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[EjectAllFromVoiceConfMsg](jsonNode)
      result match {
        case Some(msg) => Some(msg.asInstanceOf[EjectAllFromVoiceConfMsg])
        case None =>
          log.error("Failed to deserialize message: error: {} \n msg: {}", error, jsonNode)
          None
      }
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      fsApp.ejectAll(m.body.voiceConf)
    }
  }

  def routeEjectUserFromVoiceConfMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[EjectUserFromVoiceConfMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[EjectUserFromVoiceConfMsg](jsonNode)
      result match {
        case Some(msg) => Some(msg.asInstanceOf[EjectUserFromVoiceConfMsg])
        case None =>
          log.error("Failed to deserialize message: error: {} \n msg: {}", error, jsonNode)
          None
      }
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      fsApp.eject(m.body.voiceConf, m.body.voiceUserId)
    }
  }

  def routeMuteUserInVoiceConfMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[MuteUserInVoiceConfMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[MuteUserInVoiceConfMsg](jsonNode)
      result match {
        case Some(msg) => Some(msg.asInstanceOf[MuteUserInVoiceConfMsg])
        case None =>
          log.error("Failed to deserialize message: error: {} \n msg: {}", error, jsonNode)
          None
      }
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      fsApp.eject(m.body.voiceConf, m.body.voiceUserId)
    }
  }

  def routeTransferUserToVoiceConfMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[TransferUserToVoiceConfMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[TransferUserToVoiceConfMsg](jsonNode)
      result match {
        case Some(msg) => Some(msg.asInstanceOf[TransferUserToVoiceConfMsg])
        case None =>
          log.error("Failed to deserialize message: error: {} \n msg: {}", error, jsonNode)
          None
      }
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      fsApp.transferUserToMeeting(m.body.fromVoiceConf, m.body.toVoiceConf, m.body.voiceUserId)
    }
  }

  def routeStartRecordingVoiceConfMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[StartRecordingVoiceConfMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[StartRecordingVoiceConfMsg](jsonNode)
      result match {
        case Some(msg) => Some(msg.asInstanceOf[StartRecordingVoiceConfMsg])
        case None =>
          log.error("Failed to deserialize message: error: {} \n msg: {}", error, jsonNode)
          None
      }
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      fsApp.startRecording(m.body.voiceConf, m.body.meetingId)
    }
  }

  def routeStopRecordingVoiceConfMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[StopRecordingVoiceConfMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[StopRecordingVoiceConfMsg](jsonNode)
      result match {
        case Some(msg) => Some(msg.asInstanceOf[StopRecordingVoiceConfMsg])
        case None =>
          log.error("Failed to deserialize message: error: {} \n msg: {}", error, jsonNode)
          None
      }
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      fsApp.stopRecording(m.body.voiceConf, m.body.meetingId, m.body.stream)
    }
  }

}
