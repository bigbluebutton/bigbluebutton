package org.bigbluebutton.endpoint.redis

import akka.actor.{Actor, ActorLogging, ActorSystem, Props}
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.apps.groupchats.GroupChatApp
import org.bigbluebutton.core2.message.senders.MsgBuilder

import java.security.MessageDigest
import scala.concurrent.duration._
import scala.concurrent._
import ExecutionContext.Implicits.global

case object SendPeriodicReport

case class MeetingActivityTracker(
  intId: String,
  extId: String,
  name:  String,
  activityReportAccessToken: String,
  users: Map[String, UserActivityTracker] = Map(),
  polls: Map[String, Poll] = Map(),
  screenshares: Vector[Screenshare] = Vector(),
  createdOn: Long = System.currentTimeMillis(),
  endedOn: Long = 0,
)

case class UserActivityTracker(
  intId:              String,
  extId:              String,
  name:               String,
  answers:            Map[String,String] = Map(),
  talk:               Talk = Talk(),
  webcams:            Vector[Webcam] = Vector(),
  totalOfMessages:    Long = 0,
  totalOfRaiseHands:  Long = 0,
  totalOfEmojis:      Long = 0,
  registeredOn:       Long = System.currentTimeMillis(),
  leftOn:             Long = 0,
)

case class Poll(
  pollId:     String,
  pollType:   String,
  anonymous: Boolean,
  question:   String,
  options:    Vector[String] = Vector(),
  anonymousAnswers: Vector[String] = Vector(),
  createdOn:  Long = System.currentTimeMillis(),
)

case class Talk(
  totalTime: Long = 0,
  lastTalkStartedOn: Long = 0,
)

case class Webcam(
  startedOn: Long = System.currentTimeMillis(),
  stoppedOn: Long = 0,
)

case class Screenshare(
  startedOn: Long = System.currentTimeMillis(),
  stoppedOn: Long = 0,
)


object ActivityTrackerActor {
  def props(
             system:         ActorSystem,
             outGW:          OutMessageGateway,
  ): Props =
    Props(
      classOf[ActivityTrackerActor],
      system,
      outGW
    )
}

class ActivityTrackerActor(
    system:         ActorSystem,
    val outGW:          OutMessageGateway,
) extends Actor with ActorLogging {

  private var meetings: Map[String, MeetingActivityTracker] = Map()
  private var meetingsLastJsonHash : Map[String,String] = Map()

  system.scheduler.schedule(10.seconds, 10.seconds, self, SendPeriodicReport)

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
      case m: GroupChatMessageBroadcastEvtMsg       => handleGroupChatMessageBroadcastEvtMsg(m)

      // User
      case m: UserJoinedMeetingEvtMsg => handleUserJoinedMeetingEvtMsg(m)
      case m: UserLeftMeetingEvtMsg   => handleUserLeftMeetingEvtMsg(m)
      case m: UserEmojiChangedEvtMsg                => handleUserEmojiChangedEvtMsg(m)
      case m: UserBroadcastCamStartedEvtMsg         => handleUserBroadcastCamStartedEvtMsg(m)
      case m: UserBroadcastCamStoppedEvtMsg         => handleUserBroadcastCamStoppedEvtMsg(m)

      // Voice
      case m: UserJoinedVoiceConfToClientEvtMsg     => handleUserJoinedVoiceConfToClientEvtMsg(m)
      case m: UserLeftVoiceConfToClientEvtMsg       => handleUserLeftVoiceConfToClientEvtMsg(m)
      case m: UserMutedVoiceEvtMsg                  => handleUserMutedVoiceEvtMsg(m)
      case m: UserTalkingVoiceEvtMsg                => handleUserTalkingVoiceEvtMsg(m)

      // Screenshare
      case m: ScreenshareRtmpBroadcastStartedEvtMsg => handleScreenshareRtmpBroadcastStartedEvtMsg(m)
      case m: ScreenshareRtmpBroadcastStoppedEvtMsg => handleScreenshareRtmpBroadcastStoppedEvtMsg(m)

      // Meeting
      case m: CreateMeetingReqMsg         => handleCreateMeetingReqMsg(m)
      case m: MeetingEndingEvtMsg     => handleMeetingEndingEvtMsg(m)

      // Poll
      case m: PollStartedEvtMsg                     => handlePollStartedEvtMsg(m)
      case m: UserRespondedToPollRecordMsg          => handleUserRespondedToPollRecordMsg(m)

      case _                          => // message not to be handled.
    }
  }

  private def handleGroupChatMessageBroadcastEvtMsg(msg: GroupChatMessageBroadcastEvtMsg) {
    if (msg.body.chatId == GroupChatApp.MAIN_PUBLIC_CHAT) {
      for {
        meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
        user <- meeting.users.values.find(u => u.intId == msg.header.userId)
      } yield {
        val updatedUser = user.copy(totalOfMessages = user.totalOfMessages + 1)
        val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.intId -> updatedUser))
        meetings += (updatedMeeting.intId -> updatedMeeting)
      }
    }
  }


  private def handleUserJoinedMeetingEvtMsg(msg: UserJoinedMeetingEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      val user: UserActivityTracker = meeting.users.values.find(u => u.intId == msg.body.intId).getOrElse({
        UserActivityTracker(
          msg.body.intId, msg.body.extId, msg.body.name
        )
      })

      meetings += (meeting.intId -> meeting.copy(users = meeting.users + (user.intId -> user.copy(leftOn = 0))))
    }
  }

  private def handleUserLeftMeetingEvtMsg(msg: UserLeftMeetingEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- meeting.users.values.find(u => u.intId == msg.body.intId)
    } yield {
      val updatedUser = user.copy(leftOn = System.currentTimeMillis())
      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.intId -> updatedUser))

      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handleUserEmojiChangedEvtMsg(msg: UserEmojiChangedEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- meeting.users.values.find(u => u.intId == msg.body.userId)
    } yield {

      if (msg.body.emoji == "raiseHand") {
        val updatedUser = user.copy(totalOfRaiseHands = user.totalOfRaiseHands + 1)
        val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.intId -> updatedUser))
        meetings += (updatedMeeting.intId -> updatedMeeting)
      } else if (msg.body.emoji != "none") {
        val updatedUser = user.copy(totalOfEmojis = user.totalOfEmojis + 1)
        val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.intId -> updatedUser))

        meetings += (updatedMeeting.intId -> updatedMeeting)
      }
    }
  }

  private def handleUserBroadcastCamStartedEvtMsg(msg: UserBroadcastCamStartedEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- meeting.users.values.find(u => u.intId == msg.body.userId)
    } yield {

      val updatedUser = user.copy(webcams = user.webcams :+ Webcam())
      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.intId -> updatedUser))
      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handleUserBroadcastCamStoppedEvtMsg(msg: UserBroadcastCamStoppedEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- meeting.users.values.find(u => u.intId == msg.body.userId)
    } yield {
      val lastWebcam: Webcam = user.webcams.last.copy(stoppedOn = System.currentTimeMillis())
      val updatedUser = user.copy(webcams = user.webcams.dropRight(1) :+ lastWebcam)
      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.intId -> updatedUser))
      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handleUserJoinedVoiceConfToClientEvtMsg(msg: UserJoinedVoiceConfToClientEvtMsg): Unit = {
    //dont store this info yet
  }

  private def handleUserLeftVoiceConfToClientEvtMsg(msg: UserLeftVoiceConfToClientEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- meeting.users.values.find(u => u.intId == msg.body.intId)
    } yield {
      endUserTalk(meeting, user)
    }
  }

  private def handleUserMutedVoiceEvtMsg(msg: UserMutedVoiceEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- meeting.users.values.find(u => u.intId == msg.body.intId)
    } yield {
      endUserTalk(meeting, user)
    }
  }

  private def handleUserTalkingVoiceEvtMsg(msg: UserTalkingVoiceEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- meeting.users.values.find(u => u.intId == msg.body.intId)
    } yield {
      if(msg.body.talking) {
        val updatedUser = user.copy(talk = user.talk.copy(lastTalkStartedOn = System.currentTimeMillis()))
        val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.intId -> updatedUser))
        meetings += (updatedMeeting.intId -> updatedMeeting)
      } else {
        endUserTalk(meeting, user)
      }
    }
  }

  private def endUserTalk(meeting: MeetingActivityTracker, user: UserActivityTracker): Unit = {
    if(user.talk.lastTalkStartedOn > 0) {
      val updatedUser = user.copy(
        talk = user.talk.copy(
          lastTalkStartedOn = 0,
          totalTime = user.talk.totalTime + (System.currentTimeMillis() - user.talk.lastTalkStartedOn)
        )
      )
      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.intId -> updatedUser))
      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handlePollStartedEvtMsg(msg: PollStartedEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      val options = msg.body.poll.answers.map(answer => answer.key)
      val newPoll = Poll(msg.body.pollId, msg.body.pollType, msg.body.secretPoll, msg.body.question, options.toVector)

      val updatedMeeting = meeting.copy(polls = meeting.polls + (newPoll.pollId -> newPoll))
      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handleUserRespondedToPollRecordMsg(msg: UserRespondedToPollRecordMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- meeting.users.values.find(u => u.intId == msg.header.userId)
    } yield {
      if(msg.body.isSecret) {
        //Store Anonymous Poll in `poll.anonymousAnswers`
        for {
          poll <- meeting.polls.find(p => p._1 == msg.body.pollId)
        } yield {
          val updatedPoll = poll._2.copy(anonymousAnswers = poll._2.anonymousAnswers :+ msg.body.answer)
          val updatedMeeting = meeting.copy(polls = meeting.polls + (poll._1 -> updatedPoll))
          meetings += (updatedMeeting.intId -> updatedMeeting)
        }
      } else {
        //Store Public Poll in `user.answers`
        val updatedUser = user.copy(answers = user.answers + (msg.body.pollId -> msg.body.answer))
        val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.intId -> updatedUser))
        meetings += (updatedMeeting.intId -> updatedMeeting)
      }
    }
  }

  private def handleScreenshareRtmpBroadcastStartedEvtMsg(msg: ScreenshareRtmpBroadcastStartedEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      val updatedMeeting = meeting.copy(screenshares = meeting.screenshares :+ Screenshare())
      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handleScreenshareRtmpBroadcastStoppedEvtMsg(msg: ScreenshareRtmpBroadcastStoppedEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      val lastScreenshare: Screenshare = meeting.screenshares.last.copy(stoppedOn = System.currentTimeMillis())
      val updatedMeeting = meeting.copy(screenshares = meeting.screenshares.dropRight(1) :+ lastScreenshare)
      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handleCreateMeetingReqMsg(msg: CreateMeetingReqMsg): Unit = {
    if(msg.body.props.meetingProp.activityReportTracking) {
      val newMeeting = MeetingActivityTracker(
        msg.body.props.meetingProp.intId,
        msg.body.props.meetingProp.extId,
        msg.body.props.meetingProp.name,
        msg.body.props.password.activityReportAccessToken,
      )

      meetings += (newMeeting.intId -> newMeeting)

      log.info("ActivityTracker created for meeting {}.",msg.body.props.meetingProp.intId)
    } else {
      log.info("ActivityTracker disabled for meeting {}.",msg.body.props.meetingProp.intId)
    }
  }

  private def handleMeetingEndingEvtMsg(msg: MeetingEndingEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.body.meetingId)
    } yield {
      //Update endedOn and screenshares.stoppedOn, user.totalTime talks, webcams.stoppedOn
      val endedOn : Long = System.currentTimeMillis()
      val updatedMeeting = meeting.copy(
        endedOn = endedOn,
        screenshares = meeting.screenshares.map(screenshare => {
          if(screenshare.stoppedOn > 0) screenshare;
          else screenshare.copy(stoppedOn = endedOn)
        }),
        users = meeting.users.map(user => {
          (user._1 ->
            user._2.copy(
              leftOn = if(user._2.leftOn > 0) user._2.leftOn else endedOn,
              talk = user._2.talk.copy(
                totalTime = user._2.talk.totalTime + (if (user._2.talk.lastTalkStartedOn > 0) (endedOn - user._2.talk.lastTalkStartedOn) else 0),
                lastTalkStartedOn = 0
              ),
              webcams = user._2.webcams.map(webcam => {
                if(webcam.stoppedOn > 0) webcam
                else webcam.copy(stoppedOn = endedOn)
              })
          ))
      })
      )

      meetings += (updatedMeeting.intId -> updatedMeeting)

      //Send report one last time
      sendReport(updatedMeeting)

      meetings = meetings.-(updatedMeeting.intId)
      log.info("ActivityTracker removed for meeting {}.",updatedMeeting.intId)
    }
  }

  private def sendPeriodicReport(): Unit = {
    meetings.map(meeting => {
      sendReport(meeting._2)
    })
  }

  private def sendReport(meeting : MeetingActivityTracker): Unit = {
    val activityJson: String = JsonUtil.toJson(meeting)

    //Avoid send repeated activity jsons
    val activityJsonHash : String = MessageDigest.getInstance("MD5").digest(activityJson.getBytes).mkString
    if(!meetingsLastJsonHash.contains(meeting.intId) || meetingsLastJsonHash.get(meeting.intId).getOrElse("") != activityJsonHash) {
      val event = MsgBuilder.buildActivityReportEvtMsg(meeting.intId, activityJson)
      outGW.send(event)

      meetingsLastJsonHash += (meeting.intId -> activityJsonHash)

      log.info("Activity Report sent for meeting {}",meeting.intId)
    }
  }

}
