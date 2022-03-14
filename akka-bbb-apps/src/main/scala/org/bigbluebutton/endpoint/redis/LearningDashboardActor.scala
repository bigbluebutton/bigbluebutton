package org.bigbluebutton.endpoint.redis

import akka.actor.{Actor, ActorLogging, ActorSystem, Props}
import org.bigbluebutton.common2.domain.PresentationVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.apps.groupchats.GroupChatApp
import org.bigbluebutton.core.models._
import org.bigbluebutton.core2.message.senders.MsgBuilder

import java.security.MessageDigest
import scala.concurrent.duration._
import scala.concurrent._
import ExecutionContext.Implicits.global

case object SendPeriodicReport

case class Meeting(
  intId: String,
  extId: String,
  name:  String,
  users: Map[String, User] = Map(),
  polls: Map[String, Poll] = Map(),
  screenshares: Vector[Screenshare] = Vector(),
  presentationSlides: Vector[PresentationSlide] = Vector(),
  createdOn: Long = System.currentTimeMillis(),
  endedOn: Long = 0,
)

case class User(
  userKey:            String,
  extId:              String,
  intIds:             Map[String,UserId] = Map(),
  name:               String,
  isModerator:        Boolean,
  isDialIn:           Boolean = false,
  currentIntId:       String = null,
  answers:            Map[String,Vector[String]] = Map(),
  talk:               Talk = Talk(),
  emojis:             Vector[Emoji] = Vector(),
  webcams:            Vector[Webcam] = Vector(),
  totalOfMessages:    Long = 0,
)

case class UserId(
  intId:         String,
  registeredOn:  Long = System.currentTimeMillis(),
  leftOn:        Long = 0,
  userLeftFlag:  Boolean = false,
)

case class Poll(
  pollId:     String,
  pollType:   String,
  anonymous:  Boolean,
  multiple:   Boolean,
  question:   String,
  options:    Vector[String] = Vector(),
  anonymousAnswers: Vector[String] = Vector(),
  createdOn:  Long = System.currentTimeMillis(),
)

case class Talk(
  totalTime: Long = 0,
  lastTalkStartedOn: Long = 0,
)

case class Emoji(
  name: String,
  sentOn: Long = System.currentTimeMillis(),
)

case class Webcam(
  startedOn: Long = System.currentTimeMillis(),
  stoppedOn: Long = 0,
)

case class Screenshare(
  startedOn: Long = System.currentTimeMillis(),
  stoppedOn: Long = 0,
)

case class PresentationSlide(
  presentationId: String,
  pageNum: Long,
  setOn: Long = System.currentTimeMillis(),
)


object LearningDashboardActor {
  def props(
             system:         ActorSystem,
             outGW:          OutMessageGateway,
  ): Props =
    Props(
      classOf[LearningDashboardActor],
      system,
      outGW
    )
}

class LearningDashboardActor(
    system:         ActorSystem,
    val outGW:          OutMessageGateway,
) extends Actor with ActorLogging {

  private var meetings: Map[String, Meeting] = Map()
  private var meetingAccessTokens: Map[String,String] = Map()
  private var meetingsLastJsonHash : Map[String,String] = Map()
  private var meetingPresentations : Map[String,Map[String,PresentationVO]] = Map()
  private var meetingExcludedUserIds : Map[String,Vector[String]] = Map()

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

      // Presentation
      case m: PresentationConversionCompletedEvtMsg => handlePresentationConversionCompletedEvtMsg(m)
      case m: SetCurrentPageEvtMsg                  => handleSetCurrentPageEvtMsg(m)
      case m: RemovePresentationEvtMsg              => handleRemovePresentationEvtMsg(m)
      case m: SetCurrentPresentationEvtMsg          => handleSetCurrentPresentationEvtMsg(m)

      // User
      case m: UserRegisteredRespMsg                 => handleUserRegisteredRespMsg(m)
      case m: UserJoinedMeetingEvtMsg               => handleUserJoinedMeetingEvtMsg(m)
      case m: UserJoinMeetingReqMsg                 => handleUserJoinMeetingReqMsg(m)
      case m: UserLeaveReqMsg                       => handleUserLeaveReqMsg(m)
      case m: UserLeftMeetingEvtMsg                 => handleUserLeftMeetingEvtMsg(m)
      case m: UserEmojiChangedEvtMsg                => handleUserEmojiChangedEvtMsg(m)
      case m: UserRoleChangedEvtMsg                 => handleUserRoleChangedEvtMsg(m)
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
        user <- findUserByIntId(meeting, msg.header.userId)
      } yield {
        val updatedUser = user.copy(totalOfMessages = user.totalOfMessages + 1)
        val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))

        meetings += (updatedMeeting.intId -> updatedMeeting)
      }
    }
  }

  private def handlePresentationConversionCompletedEvtMsg(msg: PresentationConversionCompletedEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      val updatedPresentations = meetingPresentations.get(meeting.intId).getOrElse(Map()) + (msg.body.presentation.id -> msg.body.presentation)
      meetingPresentations += (meeting.intId -> updatedPresentations)
      if(msg.body.presentation.current == true) {
        for {
          page <- msg.body.presentation.pages.find(p => p.current == true)
        } yield {
          this.setPresentationSlide(meeting.intId, msg.body.presentation.id,page.num)
        }
      }
    }
  }

  private def handleSetCurrentPageEvtMsg(msg: SetCurrentPageEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      presentations <- meetingPresentations.get(meeting.intId)
      presentation <- presentations.get(msg.body.presentationId)
      page <- presentation.pages.find(p => p.id == msg.body.pageId)
    } yield {
      this.setPresentationSlide(meeting.intId, msg.body.presentationId,page.num)
    }
  }

  private def handleRemovePresentationEvtMsg(msg: RemovePresentationEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      if(meeting.presentationSlides.last.presentationId == msg.body.presentationId) {
        this.setPresentationSlide(meeting.intId, "",0)
      }
    }
  }

  private def handleSetCurrentPresentationEvtMsg(msg: SetCurrentPresentationEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      val presPreviousSlides: Vector[PresentationSlide] = meeting.presentationSlides.filter(p => p.presentationId == msg.body.presentationId);
      if(presPreviousSlides.length > 0) {
        //Set last page showed for this presentation
        this.setPresentationSlide(meeting.intId, msg.body.presentationId,presPreviousSlides.last.pageNum)
      } else {
        //If none page was showed yet, set the current page (page 1 by default)
        for {
          presentations <- meetingPresentations.get(meeting.intId)
          presentation <- presentations.get(msg.body.presentationId)
          page <- presentation.pages.find(s => s.current == true)
        } yield  {
          this.setPresentationSlide(meeting.intId, msg.body.presentationId,page.num)
        }
      }
    }
  }

  private def setPresentationSlide(meetingId: String, presentationId: String, pageNum: Long) {
    for {
      meeting <- meetings.values.find(m => m.intId == meetingId)
    } yield {
      if (meeting.presentationSlides.length == 0 ||
        meeting.presentationSlides.last.presentationId != presentationId ||
        meeting.presentationSlides.last.pageNum != pageNum) {
        val updatedMeeting = meeting.copy(presentationSlides = meeting.presentationSlides :+ PresentationSlide(presentationId, pageNum))

        meetings += (updatedMeeting.intId -> updatedMeeting)
      }
    }
  }

  private def handleUserRegisteredRespMsg(msg: UserRegisteredRespMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
     if(msg.body.excludeFromDashboard == true) {
       meetingExcludedUserIds += (meeting.intId -> {
         meetingExcludedUserIds.get(meeting.intId).getOrElse(Vector()) :+ msg.body.userId
       })
     }
    }
  }

  private def findUserByIntId(meeting: Meeting, intId: String): Option[User] = {
    meeting.users.values.find(u => u.currentIntId == intId ||  (u.currentIntId == null && u.intIds.exists(uId => uId._2.intId == intId && uId._2.leftOn == 0)))
  }

  private def findUserByExtId(meeting: Meeting, extId: String, filterUserLeft: Boolean = false): Option[User] = {
    meeting.users.values.find(u => {
      u.extId == extId && (filterUserLeft == false || !u.intIds.exists(uId => uId._2.leftOn == 0 && uId._2.userLeftFlag == false))
    })
  }

  private def getNextKey(meeting: Meeting, extId: String): String = {
    extId + "-" + (meeting.users.values.filter(u => u.extId == extId).toVector.size + 1).toString
  }

  private def handleUserJoinMeetingReqMsg(msg: UserJoinMeetingReqMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      val user = findUserByIntId(meeting, msg.body.userId).getOrElse(null)

      if(user != null) {
        for {
          userId <- user.intIds.get(msg.body.userId)
        } yield {
          val updatedUser = user.copy(currentIntId = userId.intId, intIds = user.intIds + (userId.intId -> userId.copy(leftOn = 0, userLeftFlag = false)))
          val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))

          meetings += (updatedMeeting.intId -> updatedMeeting)
        }
      } else {
        val userLeftFlagged = meeting.users.values.filter(u => u.intIds.exists(uId => {
          uId._2.intId == msg.body.userId && uId._2.userLeftFlag == true && uId._2.leftOn == 0
        }))

        //Flagged user must be reactivated, once UserJoinedMeetingEvtMsg won't be sent
        if(userLeftFlagged.size > 0) {
          this.addUserToMeeting(
            msg.header.meetingId,
            msg.body.userId,
            userLeftFlagged.last.extId,
            userLeftFlagged.last.name,
            userLeftFlagged.last.isModerator,
            userLeftFlagged.last.isDialIn)
        }
      }
    }
  }

  private def handleUserJoinedMeetingEvtMsg(msg: UserJoinedMeetingEvtMsg): Unit = {
    this.addUserToMeeting(msg.header.meetingId, msg.body.intId, msg.body.extId, msg.body.name, (msg.body.role == Roles.MODERATOR_ROLE), false)
  }

  private def handleUserLeaveReqMsg(msg: UserLeaveReqMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.body.userId)
      userId <- user.intIds.get(msg.body.userId)
    } yield {
      val updatedUser = user.copy(currentIntId = null, intIds = user.intIds + (userId.intId -> userId.copy(userLeftFlag = true)))
      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))

      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handleUserLeftMeetingEvtMsg(msg: UserLeftMeetingEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- meeting.users.values.find(u => u.intIds.exists(uId => uId._2.intId == msg.body.intId && uId._2.leftOn == 0))
      userId <- user.intIds.get(msg.body.intId)
    } yield {
      val updatedUser = user.copy(
        currentIntId = if(user.currentIntId == userId.intId) null else user.currentIntId,
        intIds = user.intIds + (userId.intId -> userId.copy(leftOn = System.currentTimeMillis()))
      )
      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))

      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handleUserEmojiChangedEvtMsg(msg: UserEmojiChangedEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.body.userId)
    } yield {
      if (msg.body.emoji != "none") {
        val updatedUser = user.copy(emojis = user.emojis :+ Emoji(msg.body.emoji))
        val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))

        meetings += (updatedMeeting.intId -> updatedMeeting)
      }
    }
  }

  private def handleUserRoleChangedEvtMsg(msg: UserRoleChangedEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.body.userId)
    } yield {
      val updatedUser = user.copy(isModerator = (msg.body.role == Roles.MODERATOR_ROLE))
      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))

      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handleUserBroadcastCamStartedEvtMsg(msg: UserBroadcastCamStartedEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.body.userId)
    } yield {

      val updatedUser = user.copy(webcams = user.webcams :+ Webcam())
      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))
      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handleUserBroadcastCamStoppedEvtMsg(msg: UserBroadcastCamStoppedEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.body.userId)
    } yield {
      val lastWebcam: Webcam = user.webcams.last.copy(stoppedOn = System.currentTimeMillis())
      val updatedUser = user.copy(webcams = user.webcams.dropRight(1) :+ lastWebcam)
      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))
      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handleUserJoinedVoiceConfToClientEvtMsg(msg: UserJoinedVoiceConfToClientEvtMsg): Unit = {
    //Create users for Dial-in connections
    if(msg.body.intId.startsWith(IntIdPrefixType.DIAL_IN)) {
      this.addUserToMeeting(msg.header.meetingId, msg.body.intId, msg.body.callerName, msg.body.callerName, false, true)
    }
  }

  private def handleUserLeftVoiceConfToClientEvtMsg(msg: UserLeftVoiceConfToClientEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.body.intId)
      userId <- user.intIds.get(msg.body.intId)
    } yield {
      endUserTalk(meeting, user)

      if(user.isDialIn) {
        val updatedUser = user.copy(intIds = user.intIds + (userId.intId -> userId.copy(leftOn = System.currentTimeMillis())))
        val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))

        meetings += (updatedMeeting.intId -> updatedMeeting)
      }
    }
  }

  private def handleUserMutedVoiceEvtMsg(msg: UserMutedVoiceEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.body.intId)
    } yield {
      endUserTalk(meeting, user)
    }
  }

  private def handleUserTalkingVoiceEvtMsg(msg: UserTalkingVoiceEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.body.intId)
    } yield {
      if(msg.body.talking) {
        val updatedUser = user.copy(talk = user.talk.copy(lastTalkStartedOn = System.currentTimeMillis()))
        val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))
        meetings += (updatedMeeting.intId -> updatedMeeting)
      } else {
        endUserTalk(meeting, user)
      }
    }
  }

  private def endUserTalk(meeting: Meeting, user: User): Unit = {
    if(user.talk.lastTalkStartedOn > 0) {
      val updatedUser = user.copy(
        talk = user.talk.copy(
          lastTalkStartedOn = 0,
          totalTime = user.talk.totalTime + (System.currentTimeMillis() - user.talk.lastTalkStartedOn)
        )
      )
      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))
      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handlePollStartedEvtMsg(msg: PollStartedEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      val options = msg.body.poll.answers.map(answer => answer.key)
      val newPoll = Poll(msg.body.pollId, msg.body.pollType, msg.body.secretPoll, msg.body.poll.isMultipleResponse, msg.body.question, options.toVector)

      val updatedMeeting = meeting.copy(polls = meeting.polls + (newPoll.pollId -> newPoll))
      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handleUserRespondedToPollRecordMsg(msg: UserRespondedToPollRecordMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.header.userId)
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
        val updatedUser = user.copy(answers = user.answers + (msg.body.pollId -> (user.answers.get(msg.body.pollId).getOrElse(Vector()) :+ msg.body.answer)))
        val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))
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
    if (msg.body.props.meetingProp.disabledFeatures.contains("learningDashboard") == false) {
      val newMeeting = Meeting(
        msg.body.props.meetingProp.intId,
        msg.body.props.meetingProp.extId,
        msg.body.props.meetingProp.name,
      )

      meetings += (newMeeting.intId -> newMeeting)
      meetingAccessTokens += (newMeeting.intId -> msg.body.props.password.learningDashboardAccessToken)

      log.info(" created for meeting {}.",msg.body.props.meetingProp.intId)
    } else {
      log.info(" disabled for meeting {}.",msg.body.props.meetingProp.intId)
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
          (user._1 -> userWithLeftProps(user._2, endedOn))
      })
      )

      meetings += (updatedMeeting.intId -> updatedMeeting)

      //Send report one last time
      sendReport(updatedMeeting)

      meetings = meetings.-(updatedMeeting.intId)
      meetingPresentations = meetingPresentations.-(updatedMeeting.intId)
      meetingAccessTokens = meetingAccessTokens.-(updatedMeeting.intId)
      meetingExcludedUserIds = meetingExcludedUserIds.-(updatedMeeting.intId)
      meetingsLastJsonHash = meetingsLastJsonHash.-(updatedMeeting.intId)
      log.info(" removed for meeting {}.",updatedMeeting.intId)
    }
  }

  private def userWithLeftProps(user: User, endedOn: Long, forceFlaggedIdsToLeft: Boolean = true): User = {
    user.copy(
      currentIntId = null,
      intIds = user.intIds.map(uId => {
        if(uId._2.leftOn > 0) (uId._1 -> uId._2)
        else if(forceFlaggedIdsToLeft == false && uId._2.userLeftFlag == true) (uId._1 -> uId._2)
        else (uId._1 -> uId._2.copy(leftOn = endedOn))
      }),
      talk = user.talk.copy(
        totalTime = user.talk.totalTime + (if (user.talk.lastTalkStartedOn > 0) (endedOn - user.talk.lastTalkStartedOn) else 0),
        lastTalkStartedOn = 0
      ),
      webcams = user.webcams.map(webcam => {
        if(webcam.stoppedOn > 0) webcam
        else webcam.copy(stoppedOn = endedOn)
      })
    )
  }

  private def addUserToMeeting(meetingIntId: String, intId: String, extId: String, name: String, isModerator: Boolean, isDialIn: Boolean): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == meetingIntId)
    } yield {
      if(!meetingExcludedUserIds.get(meeting.intId).getOrElse(Vector()).contains(extId)) {
        val currentTime = System.currentTimeMillis();

        val user: User = userWithLeftProps(
          findUserByIntId(meeting, intId).getOrElse(
            findUserByExtId(meeting, extId, true).getOrElse({
              User(
                getNextKey(meeting, extId),
                extId,
                Map(),
                name,
                isModerator,
                isDialIn,
                currentIntId = intId,
              )
            })
          )
          , currentTime, false)

        meetings += (meeting.intId -> meeting.copy(
          //Set leftOn to same intId in past user records
          users = meeting.users.map(u => {
            (u._1 -> u._2.copy(
              intIds = u._2.intIds.map(uId => {
                (uId._1 -> {
                  if (uId._2.intId == intId && uId._2.leftOn == 0) uId._2.copy(leftOn = currentTime)
                  else uId._2
                })
              })))
          }) + (user.userKey -> user.copy(
            currentIntId = intId,
            intIds = user.intIds + (intId -> user.intIds.get(intId).getOrElse(UserId(intId, currentTime)).copy(
              leftOn = 0,
              userLeftFlag = false
            ))
          ))
        ))
      }
    }
  }

  private def sendPeriodicReport(): Unit = {
    meetings.map(meeting => {
      sendReport(meeting._2)
    })
  }

  private def sendReport(meeting : Meeting): Unit = {
    val activityJson: String = JsonUtil.toJson(meeting)

    //Avoid send repeated activity jsons
    val activityJsonHash : String = MessageDigest.getInstance("MD5").digest(activityJson.getBytes).mkString
    if(!meetingsLastJsonHash.contains(meeting.intId) || meetingsLastJsonHash.get(meeting.intId).getOrElse("") != activityJsonHash) {
      for {
        learningDashboardAccessToken <- meetingAccessTokens.get(meeting.intId)
      } yield {
        val event = MsgBuilder.buildLearningDashboardEvtMsg(meeting.intId, learningDashboardAccessToken, activityJson)
        outGW.send(event)
        meetingsLastJsonHash += (meeting.intId -> activityJsonHash)

        for {
          learningDashboardAccessToken <- meetingAccessTokens.get(meeting.intId)
        } yield {
          val event = MsgBuilder.buildLearningDashboardEvtMsg(meeting.intId, learningDashboardAccessToken, activityJson)
          outGW.send(event)

          meetingsLastJsonHash += (meeting.intId -> activityJsonHash)

          log.info("Learning Dashboard data sent for meeting {}", meeting.intId)
        }
      }
    }
  }

}
