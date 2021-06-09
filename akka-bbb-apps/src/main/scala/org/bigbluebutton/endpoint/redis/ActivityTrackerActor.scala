package org.bigbluebutton.endpoint.redis

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.redis.{ RedisConfig, RedisStorageProvider }
import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.ActorSystem
import akka.actor.Props

import scala.concurrent.duration._
import scala.concurrent._
import ExecutionContext.Implicits.global


case object SendPeriodicReport

case class MeetingActivityTracker(
                                   intId: String,
                                   extId: String,
                                   name:  String,
                                   users: Map[String, UserActivityTracker],
                                 )

case class UserActivityTracker(
                                intId:        String,
                                extId:        String,
                                name:         String,
                                registeredOn: Long = System.currentTimeMillis(),
                                leftOn:       Long = 0,
                              )


object ActivityTrackerActor {
  def props(
      system:         ActorSystem,
      redisConfig:    RedisConfig,
//      healthzService: HealthzService
  ): Props =
    Props(
      classOf[ActivityTrackerActor],
      system,
      redisConfig,
//      healthzService
    )
}

class ActivityTrackerActor(
    system:         ActorSystem,
    redisConfig:    RedisConfig,
//    healthzService: HealthzService
)
  extends RedisStorageProvider(
    system,
    "BbbAppsAkkaRecorder",
    redisConfig
  ) with Actor with ActorLogging {

  private var meetings: Map[String, MeetingActivityTracker] = Map()

  system.scheduler.schedule(10.seconds, 10.seconds, self, SendPeriodicReport)

  private def record(session: String, message: java.util.Map[java.lang.String, java.lang.String]): Unit = {
    redis.recordAndExpire(session, message)
  }

  def receive = {
    //=============================
    // 2x messages
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)
    case SendPeriodicReport       => sendPeriodicReport()
    case _                        => // do nothing
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      // Chat
      //      case m: GroupChatMessageBroadcastEvtMsg       => handleGroupChatMessageBroadcastEvtMsg(m)
      //      case m: ClearPublicChatHistoryEvtMsg          => handleClearPublicChatHistoryEvtMsg(m)

      // User
      case m: UserJoinedMeetingEvtMsg => handleUserJoinedMeetingEvtMsg(m)
      case m: UserLeftMeetingEvtMsg   => handleUserLeftMeetingEvtMsg(m)
      //      case m: PresenterAssignedEvtMsg               => handlePresenterAssignedEvtMsg(m)
      //      case m: UserEmojiChangedEvtMsg                => handleUserEmojiChangedEvtMsg(m)
      //      case m: UserRoleChangedEvtMsg                 => handleUserRoleChangedEvtMsg(m)
      //      case m: UserBroadcastCamStartedEvtMsg         => handleUserBroadcastCamStartedEvtMsg(m)
      //      case m: UserBroadcastCamStoppedEvtMsg         => handleUserBroadcastCamStoppedEvtMsg(m)

      // Voice
      //      case m: UserJoinedVoiceConfToClientEvtMsg     => handleUserJoinedVoiceConfToClientEvtMsg(m)
      //      case m: UserLeftVoiceConfToClientEvtMsg       => handleUserLeftVoiceConfToClientEvtMsg(m)
      //      case m: UserMutedVoiceEvtMsg                  => handleUserMutedVoiceEvtMsg(m)
      //      case m: UserTalkingVoiceEvtMsg                => handleUserTalkingVoiceEvtMsg(m)
      //
      //      case m: VoiceRecordingStartedEvtMsg           => handleVoiceRecordingStartedEvtMsg(m)
      //      case m: VoiceRecordingStoppedEvtMsg           => handleVoiceRecordingStoppedEvtMsg(m)

      // Meeting
      //      case m: RecordingStatusChangedEvtMsg          => handleRecordingStatusChangedEvtMsg(m)
      //      case m: RecordStatusResetSysMsg               => handleRecordStatusResetSysMsg(m)
      //      case m: WebcamsOnlyForModeratorChangedEvtMsg  => handleWebcamsOnlyForModeratorChangedEvtMsg(m)
      case m: CreateMeetingReqMsg         => handleCreateMeetingReqMsg(m)
      case m: MeetingEndingEvtMsg     => handleMeetingEndingEvtMsg(m)

      case _                          => // message not to be recorded.
    }
  }

  private def handleUserJoinedMeetingEvtMsg(msg: UserJoinedMeetingEvtMsg): Unit = {
    log.info("------------------")
    log.info("handleUserJoinedMeetingEvtMsg.")

    log.info("user entrou....")

    val newUser = UserActivityTracker(
      msg.body.intId, msg.body.extId, msg.body.name
    )

    log.info(newUser.intId)
    log.info(newUser.name)

    val findMeeting = meetings.values.find(m => m.intId == msg.header.meetingId)

    val registeredMeeting: MeetingActivityTracker = findMeeting.getOrElse({
      MeetingActivityTracker(
        msg.header.meetingId, msg.header.meetingId, msg.header.meetingId, Map()
      )
    })


    log.info("----meeting")
    log.info(registeredMeeting.intId)
    log.info(registeredMeeting.name)

    val refreshedMeeting = registeredMeeting.copy(users = registeredMeeting.users + (newUser.intId -> newUser))

    meetings += (refreshedMeeting.intId -> refreshedMeeting)

    log.info("----meetings: " + meetings.toVector.length)
  }

  private def handleUserLeftMeetingEvtMsg(msg: UserLeftMeetingEvtMsg): Unit = {
    log.info("------------------")
    log.info("handleUserLeftMeetingEvtMsg.")

    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- meeting.users.values.find(u => u.intId == msg.body.intId)
    } yield {
      val updatedUser = user.copy(leftOn = System.currentTimeMillis())
      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.intId -> updatedUser))

      meetings += (updatedMeeting.intId -> updatedMeeting)
    }


  }

  private def handleCreateMeetingReqMsg(msg: CreateMeetingReqMsg): Unit = {
    log.info("------------------")
    log.info("handleCreateMeetingReqMsg.")

    val newMeeting = MeetingActivityTracker(
      msg.body.props.meetingProp.intId,
      msg.body.props.meetingProp.extId,
      msg.body.props.meetingProp.name,
      Map()
    )

    meetings += (newMeeting.intId -> newMeeting)
  }

  private def handleMeetingEndingEvtMsg(msg: MeetingEndingEvtMsg): Unit = {
    log.info("------------------")
    log.info("handleMeetingEndingEvtMsg.")

    for {
      meeting <- meetings.values.find(m => m.intId == msg.body.meetingId)
    } yield {
      log.info("------------------")
      log.info("-----Meeting ended! (infos will be sent)")
      log.info(meeting.name)
      log.info("users: " + meeting.users.toVector.length)

      meeting.users.map(user => {
        log.info(user._2.toString)
      })
    }
  }

  private def sendPeriodicReport(): Unit = {
    //    if (redis.checkConnectionStatusBasic)
    //      healthzService.sendRecordingDBStatusMessage(System.currentTimeMillis())
    //    else
    log.info("------------------")
    log.info("SendPeriodicReport.")
    log.info("meetings: " + meetings.toVector.length)

    meetings.map(meeting => {
      log.info("------------------")
      log.info(meeting._2.name)
      log.info("users: " + meeting._2.users.toVector.length)

      meeting._2.users.map(user => {
        log.info("-----")
        log.info(user._2.name)

        val registeredOn : java.util.Date = new java.util.Date(user._2.registeredOn);
        log.info("registeredOn: " + registeredOn)

        if(user._2.leftOn > 0) {
          val leftOn : java.util.Date = new java.util.Date(user._2.leftOn);
          log.info("leftOn: " + leftOn)
        } else {
          log.info("leftOn: " + user._2.leftOn)
        }


      })
    })


  }

}
