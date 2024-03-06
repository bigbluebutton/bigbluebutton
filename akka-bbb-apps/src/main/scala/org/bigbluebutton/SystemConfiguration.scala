package org.bigbluebutton

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory

import scala.util.{ Failure, Success, Try }
import com.typesafe.config.ConfigFactory

trait SystemConfiguration {
  val config = ConfigFactory.load()

  lazy val bbbWebHost = Try(config.getString("services.bbbWebHost")).getOrElse("localhost")
  lazy val bbbWebPort = Try(config.getInt("services.bbbWebPort")).getOrElse(8888)
  lazy val bbbWebAPI = Try(config.getString("services.bbbWebAPI")).getOrElse("localhost")
  lazy val bbbWebSharedSecret = Try(config.getString("services.sharedSecret")).getOrElse("changeme")
  lazy val bbbWebModeratorPassword = Try(config.getString("services.moderatorPassword")).getOrElse("changeme")
  lazy val bbbWebViewerPassword = Try(config.getString("services.viewerPassword")).getOrElse("changeme")
  lazy val keysExpiresInSec = Try(config.getInt("redis.keyExpiry")).getOrElse(14 * 86400) // 14 days

  lazy val expireLastUserLeft = Try(config.getInt("expire.lastUserLeft")).getOrElse(60) // 1 minute
  lazy val expireNeverJoined = Try(config.getInt("expire.neverJoined")).getOrElse(5 * 60) // 5 minutes

  lazy val analyticsChannel = Try(config.getString("eventBus.analyticsChannel")).getOrElse("analytics-channel")
  lazy val meetingManagerChannel = Try(config.getString("eventBus.meetingManagerChannel")).getOrElse("MeetingManagerChannel")
  lazy val outMessageChannel = Try(config.getString("eventBus.outMessageChannel")).getOrElse("OutgoingMessageChannel")
  lazy val incomingJsonMsgChannel = Try(config.getString("eventBus.incomingJsonMsgChannel")).getOrElse("IncomingJsonMsgChannel")
  lazy val outBbbMsgMsgChannel = Try(config.getString("eventBus.outBbbMsgMsgChannel")).getOrElse("OutBbbMsgChannel")
  lazy val recordServiceMessageChannel = Try(config.getString("eventBus.recordServiceMessageChannel")).getOrElse("RecordServiceMessageChannel")

  lazy val toHTML5RedisChannel = Try(config.getString("redis.toHTML5RedisChannel")).getOrElse("to-html5-redis-channel")
  lazy val fromAkkaAppsChannel = Try(config.getString("eventBus.fromAkkaAppsChannel")).getOrElse("from-akka-apps-channel")
  lazy val toAkkaAppsChannel = Try(config.getString("eventBus.toAkkaAppsChannel")).getOrElse("to-akka-apps-channel")
  lazy val fromClientChannel = Try(config.getString("eventBus.fromClientChannel")).getOrElse("from-client-channel")
  lazy val toClientChannel = Try(config.getString("eventBus.toClientChannel")).getOrElse("to-client-channel")
  lazy val toAkkaAppsJsonChannel = Try(config.getString("eventBus.toAkkaAppsChannel")).getOrElse("to-akka-apps-json-channel")
  lazy val fromAkkaAppsJsonChannel = Try(config.getString("eventBus.fromAkkaAppsChannel")).getOrElse("from-akka-apps-json-channel")

  lazy val applyPermissionCheck = Try(config.getBoolean("apps.checkPermissions")).getOrElse(false)
  lazy val ejectOnViolation = Try(config.getBoolean("apps.ejectOnViolation")).getOrElse(false)

  lazy val voiceConfRecordPath = Try(config.getString("voiceConf.recordPath")).getOrElse("/var/freeswitch/meetings")
  lazy val voiceConfRecordCodec = Try(config.getString("voiceConf.recordCodec")).getOrElse("wav")
  lazy val checkVoiceRecordingInterval = Try(config.getInt("voiceConf.checkRecordingInterval")).getOrElse(19)
  lazy val syncVoiceUsersStatusInterval = Try(config.getInt("voiceConf.syncUserStatusInterval")).getOrElse(43)
  lazy val ejectRogueVoiceUsers = Try(config.getBoolean("voiceConf.ejectRogueVoiceUsers")).getOrElse(true)
  lazy val dialInApprovalAudioPath = Try(config.getString("voiceConf.dialInApprovalAudioPath")).getOrElse("ivr/ivr-please_hold_while_party_contacted.wav")
  lazy val toggleListenOnlyAfterMuteTimer = Try(config.getInt("voiceConf.toggleListenOnlyAfterMuteTimer")).getOrElse(4)

  lazy val recordingChapterBreakLengthInMinutes = Try(config.getInt("recording.chapterBreakLengthInMinutes")).getOrElse(0)

  lazy val endMeetingWhenNoMoreAuthedUsers = Try(config.getBoolean("apps.endMeetingWhenNoMoreAuthedUsers")).getOrElse(false)
  lazy val endMeetingWhenNoMoreAuthedUsersAfterMinutes = Try(config.getInt("apps.endMeetingWhenNoMoreAuthedUsersAfterMinutes")).getOrElse(2)

  lazy val transcriptWords = Try(config.getInt("transcript.words")).getOrElse(8)
  lazy val transcriptLines = Try(config.getInt("transcript.lines")).getOrElse(2)

  lazy val reduceDuplicatedPick = Try(config.getBoolean("apps.reduceDuplicatedPick")).getOrElse(false)

  // Redis server configuration
  lazy val redisHost = Try(config.getString("redis.host")).getOrElse("127.0.0.1")
  lazy val redisPort = Try(config.getInt("redis.port")).getOrElse(6379)
  lazy val redisPassword = Try(config.getString("redis.password")).getOrElse("")
  lazy val redisExpireKey = Try(config.getInt("redis.keyExpiry")).getOrElse(1209600)

  // Redis channels
  lazy val toAkkaAppsRedisChannel = Try(config.getString("redis.toAkkaAppsRedisChannel")).getOrElse("to-akka-apps-redis-channel")
  lazy val fromAkkaAppsRedisChannel = Try(config.getString("redis.fromAkkaAppsRedisChannel")).getOrElse("from-akka-apps-redis-channel")

  lazy val toVoiceConfRedisChannel = Try(config.getString("redis.toVoiceConfRedisChannel")).getOrElse("to-voice-conf-redis-channel")
  lazy val fromVoiceConfRedisChannel = Try(config.getString("redis.fromVoiceConfRedisChannel")).getOrElse("from-voice-conf-redis-channel")

  lazy val toSfuRedisChannel = Try(config.getString("redis.toSfuRedisChannel")).getOrElse("to-sfu-redis-channel")
  lazy val fromSfuRedisChannel = Try(config.getString("redis.fromSfuRedisChannel")).getOrElse("from-sfu-redis-channel")

  lazy val fromAkkaAppsWbRedisChannel = Try(config.getString("redis.fromAkkaAppsWbRedisChannel")).getOrElse("from-akka-apps-wb-redis-channel")
  lazy val fromAkkaAppsChatRedisChannel = Try(config.getString("redis.fromAkkaAppsChatRedisChannel")).getOrElse("from-akka-apps-chat-redis-channel")
  lazy val fromAkkaAppsPresRedisChannel = Try(config.getString("redis.fromAkkaAppsPresRedisChannel")).getOrElse("from-akka-apps-pres-redis-channel")

  lazy val fromBbbWebRedisChannel = Try(config.getString("redis.fromBbbWebRedisChannel")).getOrElse("from-bbb-web-redis-channel")

  lazy val analyticsIncludeChat = Try(config.getBoolean("analytics.includeChat")).getOrElse(true)

  lazy val clientSettingsPath = Try(config.getString("client.clientSettingsFilePath")).getOrElse(
    "/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml"
  )
  lazy val clientSettingsPathOverride = Try(config.getString("client.clientSettingsOverrideFilePath")).getOrElse(
    "/etc/bigbluebutton/bbb-html5.yml"
  )

  // Grab the "interface" parameter from the http config
  val httpHost = config.getString("http.interface")
  // Grab the "port" parameter from the http config
  val httpPort = config.getInt("http.port")

  val grpcHost = config.getString("grpc.interface")
  val grpcPort = config.getInt("grpc.port")
}
