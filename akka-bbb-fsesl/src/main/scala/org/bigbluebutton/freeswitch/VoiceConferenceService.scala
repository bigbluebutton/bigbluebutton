package org.bigbluebutton.freeswitch

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.freeswitch.voice.IVoiceConferenceService
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.common2.redis.RedisPublisher
import org.bigbluebutton.freeswitch.voice.events.{ConfMember, ConfRecording}
import org.bigbluebutton.service.HealthzService
import scala.collection.JavaConverters._

class VoiceConferenceService(healthz: HealthzService,
                              sender: RedisPublisher,
                            ) extends IVoiceConferenceService with SystemConfiguration {

  val FROM_VOICE_CONF_SYSTEM_CHAN = "bigbluebutton:from-voice-conf:system"

  def voiceConfRunningAndRecording(
      voiceConfId:   String,
      isRunning:     java.lang.Boolean,
      isRecording:   java.lang.Boolean,
      confRecording: java.util.List[ConfRecording]
  ) {
    val recs: scala.collection.mutable.ListBuffer[ConfVoiceRecording] = new scala.collection.mutable.ListBuffer[ConfVoiceRecording]()
    confRecording forEach { cr =>
      recs += ConfVoiceRecording(cr.recordingPath, cr.recordingStartTime)
    }

    val header = BbbCoreVoiceConfHeader(CheckRunningAndRecordingVoiceConfEvtMsg.NAME, voiceConfId)
    val body = CheckRunningAndRecordingVoiceConfEvtMsgBody(
      voiceConfId,
      isRunning.booleanValue(),
      isRecording.booleanValue(),
      recs.toVector
    )
    val envelope = BbbCoreEnvelope(CheckRunningAndRecordingVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new CheckRunningAndRecordingVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)
  }

  def voiceConfRecordingStarted(
      voiceConfId:  String,
      recordStream: String,
      recording:    java.lang.Boolean,
      timestamp:    String
  ) {
    val header = BbbCoreVoiceConfHeader(RecordingStartedVoiceConfEvtMsg.NAME, voiceConfId)
    val body = RecordingStartedVoiceConfEvtMsgBody(voiceConfId, recordStream, recording.booleanValue(), timestamp)
    val envelope = BbbCoreEnvelope(RecordingStartedVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new RecordingStartedVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)

  }

  def voiceConfRunning(
      voiceConfId: String,
      running:     java.lang.Boolean
  ): Unit = {
    val header = BbbCoreVoiceConfHeader(VoiceConfRunningEvtMsg.NAME, voiceConfId)
    val body = VoiceConfRunningEvtMsgBody(voiceConfId, running.booleanValue())
    val envelope = BbbCoreEnvelope(VoiceConfRunningEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new VoiceConfRunningEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)
  }

  def voiceUsersStatus(
      voiceConfId:   String,
      confMembers:   java.util.List[ConfMember],
      confRecording: java.util.List[ConfRecording]
  ) {
    val users: scala.collection.mutable.ListBuffer[ConfVoiceUser] = new scala.collection.mutable.ListBuffer[ConfVoiceUser]()
    confMembers forEach { cm =>
      users += ConfVoiceUser(
        cm.voiceUserId,
        cm.userId,
        cm.callerIdName,
        cm.callerIdNum,
        cm.muted,
        cm.speaking,
        cm.callingWith,
        "freeswitch",
        cm.hold,
        cm.uuid
      )
    }

    val recs: scala.collection.mutable.ListBuffer[ConfVoiceRecording] = new scala.collection.mutable.ListBuffer[ConfVoiceRecording]()
    confRecording forEach { cr =>
      recs += ConfVoiceRecording(cr.recordingPath, cr.recordingStartTime)
    }

    val header = BbbCoreVoiceConfHeader(UserStatusVoiceConfEvtMsg.NAME, voiceConfId)
    val body = UserStatusVoiceConfEvtMsgBody(voiceConfId, users.toVector, recs.toVector)
    val envelope = BbbCoreEnvelope(UserStatusVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new UserStatusVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)

  }

  def userJoinedVoiceConf(
      voiceConfId:  String,
      voiceUserId:  String,
      userId:       String,
      callerIdName: String,
      callerIdNum:  String,
      muted:        java.lang.Boolean,
      talking:      java.lang.Boolean,
      callingWith:  String,
      hold:         java.lang.Boolean,
      uuid:         String
  ): Unit = {

    val header = BbbCoreVoiceConfHeader(UserJoinedVoiceConfEvtMsg.NAME, voiceConfId)
    val body = UserJoinedVoiceConfEvtMsgBody(voiceConfId, voiceUserId, userId, callerIdName, callerIdNum,
      muted.booleanValue(), talking.booleanValue(), callingWith,
      hold,
      uuid);
    val envelope = BbbCoreEnvelope(UserJoinedVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new UserJoinedVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)

  }

  def userLeftVoiceConf(
      voiceConfId: String,
      voiceUserId: String
  ) {

    val header = BbbCoreVoiceConfHeader(UserLeftVoiceConfEvtMsg.NAME, voiceConfId)
    val body = UserLeftVoiceConfEvtMsgBody(voiceConfId, voiceUserId)
    val envelope = BbbCoreEnvelope(UserLeftVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new UserLeftVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)

  }

  def userLockedInVoiceConf(
      voiceConfId: String,
      voiceUserId: String,
      locked:      java.lang.Boolean
  ) {

  }

  def userMutedInVoiceConf(
      voiceConfId: String,
      voiceUserId: String,
      muted:       java.lang.Boolean
  ) {

    val header = BbbCoreVoiceConfHeader(UserMutedInVoiceConfEvtMsg.NAME, voiceConfId)
    val body = UserMutedInVoiceConfEvtMsgBody(voiceConfId, voiceUserId, muted.booleanValue())
    val envelope = BbbCoreEnvelope(UserMutedInVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new UserMutedInVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)

  }

  def userTalkingInVoiceConf(
      voiceConfId: String,
      voiceUserId: String,
      talking:     java.lang.Boolean
  ) {

    val header = BbbCoreVoiceConfHeader(UserTalkingInVoiceConfEvtMsg.NAME, voiceConfId)
    val body = UserTalkingInVoiceConfEvtMsgBody(voiceConfId, voiceUserId, talking.booleanValue())
    val envelope = BbbCoreEnvelope(UserTalkingInVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new UserTalkingInVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)

  }

  def audioFloorChanged(
      voiceConfId: String,
      voiceUserId: String,
      oldVoiceUserId: String,
      floorTimestamp: String
  ) {
    val header = BbbCoreVoiceConfHeader(AudioFloorChangedVoiceConfEvtMsg.NAME, voiceConfId)
    val body = AudioFloorChangedVoiceConfEvtMsgBody(
      voiceConfId,
      voiceUserId,
      oldVoiceUserId,
      floorTimestamp
    );
    val envelope = BbbCoreEnvelope(AudioFloorChangedVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new AudioFloorChangedVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)
  }

  def voiceCallStateEvent(
      conf:             String,
      callSession:      String,
      clientSession:    String,
      userId:           String,
      voiceUserId:      String,
      callerName:       String,
      callState:        String,
      origCallerIdName: String,
      origCalledDest:   String
  ): Unit = {
    val header = BbbCoreVoiceConfHeader(VoiceConfCallStateEvtMsg.NAME, conf)
    val body = VoiceConfCallStateEvtMsgBody(
      voiceConf = conf,
      callSession = callSession,
      clientSession = clientSession,
      userId = userId,
      voiceUserId = voiceUserId,
      callerName = callerName,
      callState = callState,
      origCallerIdName = origCallerIdName,
      origCalledDest = origCalledDest
    )
    val envelope = BbbCoreEnvelope(VoiceConfCallStateEvtMsg.NAME, Map("voiceConf" -> conf))

    val msg = new VoiceConfCallStateEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)
  }

  def channelHoldChanged(
      voiceConfId:  String,
      voiceUserId:  String,
      uuid:         String,
      hold:         java.lang.Boolean
  ): Unit = {
    val header = BbbCoreVoiceConfHeader(ChannelHoldChangedVoiceConfEvtMsg.NAME, voiceConfId)
    val body = ChannelHoldChangedVoiceConfEvtMsgBody(
      voiceConfId,
      voiceUserId,
      uuid,
      hold
    );
    val envelope = BbbCoreEnvelope(ChannelHoldChangedVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new ChannelHoldChangedVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)
  }

  def freeswitchStatusReplyEvent(
      sendCommandTimestamp:      java.lang.Long,
      status:                      java.util.List[String],
      receivedResponseTimestamp: java.lang.Long
  ): Unit = {
    //println("***** >>>> " + sendCommandTimestamp)
    //println(json)
    //println("<<<< ***** " + receivedResponsTimestatmp)
    val seq = status.asScala.toVector
    healthz.setFreeswitchStatus(seq)
  }

  def freeswitchHeartbeatEvent(heartbeat: java.util.Map[String, String]): Unit = {
    //println("***** >>>> ")
    //println(json)
    //println("<<<< ***** ")
    healthz.setFreeswitchHeartbeat(heartbeat.asScala.toMap)
  }
}
