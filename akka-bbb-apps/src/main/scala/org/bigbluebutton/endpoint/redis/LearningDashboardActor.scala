package org.bigbluebutton.endpoint.redis

import org.apache.pekko.actor.{Actor, ActorLogging, ActorSystem, Props}
import org.bigbluebutton.common2.domain.PresentationVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.apps.groupchats.GroupChatApp
import org.bigbluebutton.core.db.UserActivityDAO
import org.bigbluebutton.core.models._
import org.bigbluebutton.core2.message.senders.MsgBuilder

import java.security.MessageDigest
import scala.concurrent.duration._
import scala.concurrent._
import ExecutionContext.Implicits.global
import scala.util.control.NonFatal

case object SendPeriodicReport

case class Meeting(
                    intId: String,
                    extId: String,
                    name:  String,
                    learningDashboardDisabled: Boolean,
                    downloadSessionDataEnabled: Boolean,
                    other: Map[String, String] = Map(),
                    users: Map[String, User] = Map(),
                    pluginUserDataCardTitles: Vector[String],
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
                 color:              String,
                 isDialIn:           Boolean = false,
                 avatar:             String = null,
                 currentIntId:       String = null,
                 answers:            Map[String,Vector[String]] = Map(),
                 pluginUserData:     Map[String, Vector[PluginUserData]] = Map(),
                 talk:               Talk = Talk(),
                 reactions:          Vector[Reaction] = Vector(),
                 raiseHand:          Vector[Long] = Vector(),
                 away:               Vector[Away] = Vector(),
                 webcams:            Vector[Webcam] = Vector(),
                 totalOfMessages:                 Long = 0,
                 totalOfSharedNotes:              Long = 0,
                 totalOfWhiteboardAnnotations:    Long = 0,
                 registeredInLadOn:               Long = System.currentTimeMillis(),
                 lastUserDisconnectionOn:         java.lang.Long = null,
               )

case class UserId(
                   intId:         String,
                   sessions: Vector[UserSession] = Vector(UserSession()),
                   userLeftFlag:  Boolean = false,
                 )

case class UserSession(
                        registeredOn:  Long = System.currentTimeMillis(),
                        leftOn:        Long = 0,
                      )

case class Poll(
                 pollId:         String,
                 pollType:       String,
                 anonymous:      Boolean,
                 multiple:       Boolean,
                 quiz:           Boolean,
                 question:       String,
                 options:        Vector[String] = Vector(),
                 correctOption:  String = "",
                 ended:          Boolean = false,
                 published:      Boolean = false,
                 anonymousAnswers: Vector[String] = Vector(),
                 createdOn:      Long = System.currentTimeMillis(),
               )

case class PluginUserData(
  columnTitle: String,
  value: String,
  pluginName: String
)

case class Talk(
                 totalTime: Long = 0,
                 lastTalkStartedOn: Long = 0,
               )

case class Reaction(
                     name: String,
                     sentOn: Long = System.currentTimeMillis(),
                   )

case class Away(
                 startedOn: Long = System.currentTimeMillis(),
                 stoppedOn: Long = 0,
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
                              presentationName: String,
                              pageToken: String = "",
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
  private var meetingExcludedFromDashboardUserIds : Map[String,Vector[String]] = Map()

  system.scheduler.scheduleWithFixedDelay(0.seconds, 5.seconds, self, SendPeriodicReport)

  def receive = {
    //=============================
    // 2x messages
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsgSafely(msg)
    case SendPeriodicReport       => sendPeriodicReport()
    case _                        => // do nothing
  }

  private def handleBbbCommonEnvCoreMsgSafely(msg: BbbCommonEnvCoreMsg): Unit = {
    try {
      handleBbbCommonEnvCoreMsg(msg)
    } catch {
      case NonFatal(e) =>
        log.error(e, "Failed to handle Learning Dashboard message {} with routing {}.", msg.envelope.name, msg.envelope.routing)
    }
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      // Chat
      case m: GroupChatMessageBroadcastEvtMsg       => handleGroupChatMessageBroadcastEvtMsg(m)

      // SharedNotes
      case m: PadUpdatedEvtMsg       => handlePadUpdatedEvtMsg(m)

      // Whiteboard
      case m: SendWhiteboardAnnotationsEvtMsg       => handleSendWhiteboardAnnotationsEvtMsg(m)

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
      case m: UserLeftFlagUpdatedEvtMsg             => handleUserLeftFlagUpdatedEvtMsg(m)
      case m: UserLeftMeetingEvtMsg                 => handleUserLeftMeetingEvtMsg(m)
      case m: UserAwayChangedEvtMsg                 => handleUserAwayChangedEvtMsg(m)
      case m: UserRaiseHandChangedEvtMsg            => handleUserRaiseHandChangedEvtMsg(m)
      case m: UserReactionEmojiChangedEvtMsg        => handleUserReactionEmojiChangedEvtMsg(m)
      case m: UserRoleChangedEvtMsg                 => handleUserRoleChangedEvtMsg(m)
      case m: UserBroadcastCamStartedEvtMsg         => handleUserBroadcastCamStartedEvtMsg(m)
      case m: UserBroadcastCamStoppedEvtMsg         => handleUserBroadcastCamStoppedEvtMsg(m)

      // Voice
      case m: UserJoinedVoiceConfToClientEvtMsg     => handleUserJoinedVoiceConfToClientEvtMsg(m)
      case m: UserLeftVoiceConfToClientEvtMsg       => handleUserLeftVoiceConfToClientEvtMsg(m)
      case m: UserMutedVoiceEvtMsg                  => handleUserMutedVoiceEvtMsg(m)
      case m: UserTalkingVoiceEvtMsg                => handleUserTalkingVoiceEvtMsg(m)

      // Plugin
      case m: PluginLearningAnalyticsDashboardUpsertUserDataMsg =>
        handlePluginLearningAnalyticsDashboardUpsertUserDataMsg(m)
      case m: PluginLearningAnalyticsDashboardDeleteUserDataMsg =>
        handlePluginLearningAnalyticsDashboardDeletePluginDataMsg(m)
      case m: PluginLearningAnalyticsDashboardClearAllUsersDataMsg =>
        handlePluginLearningAnalyticsDashboardClearAllUsersDataMsg(m)

      // Screenshare
      case m: ScreenshareRtmpBroadcastStartedEvtMsg => handleScreenshareRtmpBroadcastStartedEvtMsg(m)
      case m: ScreenshareRtmpBroadcastStoppedEvtMsg => handleScreenshareRtmpBroadcastStoppedEvtMsg(m)

      // Meeting
      case m: CreateMeetingReqMsg         => handleCreateMeetingReqMsg(m)
      case m: MeetingEndingEvtMsg         => handleMeetingEndingEvtMsg(m)

      // Poll
      case m: PollStartedEvtMsg                     => handlePollStartedEvtMsg(m)
      case m: UserRespondedToPollRecordMsg          => handleUserRespondedToPollRecordMsg(m)
      case m: PollShowResultEvtMsg                  => handlePollShowResultEvtMsg(m)
      case m: PollStoppedEvtMsg                     => handlePollStoppedEvtMsg(m)

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

        UserActivityDAO.insert(msg.header.meetingId, msg.header.userId, "chat-message")
      }
    }
  }

  private def handlePadUpdatedEvtMsg(msg: PadUpdatedEvtMsg) {
    if (msg.body.externalId == "notes") {
      for {
        meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
        user <- findUserByIntId(meeting, msg.body.userId)
      } yield {
        val updatedUser = user.copy(totalOfSharedNotes = user.totalOfSharedNotes + 1)
        val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))

        meetings += (updatedMeeting.intId -> updatedMeeting)

        UserActivityDAO.insert(msg.header.meetingId, msg.body.userId, "shared-notes")
      }
    }
  }

  private def handleSendWhiteboardAnnotationsEvtMsg(msg: SendWhiteboardAnnotationsEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.header.userId)
    } yield {
      val updatedUser = user.copy(totalOfWhiteboardAnnotations = user.totalOfWhiteboardAnnotations + 1)
      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))

      meetings += (updatedMeeting.intId -> updatedMeeting)

      UserActivityDAO.insert(msg.header.meetingId, msg.header.userId, "whiteboard-annotation")
    }
  }

  private def handlePresentationConversionCompletedEvtMsg(msg: PresentationConversionCompletedEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      val updatedPresentations = meetingPresentations.getOrElse(meeting.intId, Map()) + (msg.body.presentation.id -> msg.body.presentation)
      meetingPresentations += (meeting.intId -> updatedPresentations)
      if(msg.body.presentation.current) {
        for {
          page <- msg.body.presentation.pages.find(p => p.current)
        } yield {
          this.setPresentationSlide(meeting.intId, msg.body.presentation.id,page.num, msg.body.presentation.name, page.pageToken)
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
      this.setPresentationSlide(meeting.intId, msg.body.presentationId,page.num, presentation.name, page.pageToken)
    }
  }

  private def handleRemovePresentationEvtMsg(msg: RemovePresentationEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      meeting.presentationSlides.lastOption match {
        case Some(slide) if slide.presentationId == msg.body.presentationId =>
          this.setPresentationSlide(meeting.intId, "",0, "", "")
        case _ => // No matching current presentation slide to remove.
      }
    }
  }

  private def handleSetCurrentPresentationEvtMsg(msg: SetCurrentPresentationEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      val previousSlide = meeting.presentationSlides
        .filter(_.presentationId == msg.body.presentationId)
        .lastOption

      previousSlide match {
        case Some(slide) =>
          //Set last page showed for this presentation
          this.setPresentationSlide(meeting.intId, msg.body.presentationId, slide.pageNum, slide.presentationName, slide.pageToken)
        case None =>
          //If none page was showed yet, set the current page (page 1 by default)
          for {
            presentations <- meetingPresentations.get(meeting.intId)
            presentation <- presentations.get(msg.body.presentationId)
            page <- presentation.pages.find(s => s.current == true)
          } yield  {
            this.setPresentationSlide(meeting.intId, msg.body.presentationId,page.num, presentation.name, page.pageToken)
          }
      }
    }
  }

  private def setPresentationSlide(meetingId: String, presentationId: String, pageNum: Long, presentationName: String, pageToken: String) {
    for {
      meeting <- meetings.values.find(m => m.intId == meetingId)
    } yield {
      val shouldAppendSlide = meeting.presentationSlides.lastOption match {
        case Some(slide) => slide.presentationId != presentationId || slide.pageNum != pageNum
        case None => true
      }

      if (shouldAppendSlide) {
        val updatedMeeting = meeting.copy(presentationSlides = meeting.presentationSlides :+ PresentationSlide(presentationId, pageNum, presentationName = presentationName, pageToken = pageToken))

        meetings += (updatedMeeting.intId -> updatedMeeting)
      }
    }
  }

  private def handleUserRegisteredRespMsg(msg: UserRegisteredRespMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      if(msg.body.excludeFromDashboard) {
        meetingExcludedFromDashboardUserIds += (meeting.intId -> {
          meetingExcludedFromDashboardUserIds.getOrElse(meeting.intId, Vector()) :+ msg.body.userId
        })
      }
    }
  }

  private def findUserByIntId(meeting: Meeting, intId: String): Option[User] = {
    meeting.users.values.find { user =>
      user.currentIntId == intId ||
        (user.currentIntId == null && user.intIds.values.exists(userId => userId.intId == intId && hasOpenSession(userId)))
    }
  }

  private def findUserByAnyIntId(meeting: Meeting, intId: String): Option[User] = {
    meeting.users.values.find(u => u.intIds.contains(intId))
  }

  private def userHasActiveSession(user: User): Boolean = {
    user.intIds.values.exists(hasOpenUnflaggedSession)
  }

  private def findUserByExtId(meeting: Meeting, extId: String, onlyIfLeft: Boolean = false): Option[User] = {
    val latestUserWithExtId = meeting.users.values
      .filter(u => u.extId == extId)
      .toVector
      .sortBy(_.registeredInLadOn)
      .lastOption

    if(onlyIfLeft) {
      latestUserWithExtId.filterNot(userHasActiveSession)
    } else {
      latestUserWithExtId
    }
  }

  private def replaceLastItem[T](items: Vector[T], replacement: T): Vector[T] = {
    if (items.nonEmpty) items.updated(items.size - 1, replacement)
    else items
  }

  private def hasOpenSession(userId: UserId): Boolean = {
    userId.sessions.lastOption.exists(_.leftOn == 0)
  }

  private def hasOpenUnflaggedSession(userId: UserId): Boolean = {
    hasOpenSession(userId) && !userId.userLeftFlag
  }

  private def hasOpenFlaggedSession(userId: UserId): Boolean = {
    hasOpenSession(userId) && userId.userLeftFlag
  }

  private def closeOpenSession(userId: UserId, leftOn: Long): UserId = {
    userId.sessions.lastOption match {
      case Some(session) if session.leftOn == 0 =>
        userId.copy(sessions = replaceLastItem(userId.sessions, session.copy(leftOn = leftOn)))
      case _ => userId
    }
  }

  private def reopenSession(userId: UserId): UserId = {
    userId.sessions.lastOption match {
      case Some(session) =>
        userId.copy(
          sessions = replaceLastItem(userId.sessions, session.copy(leftOn = 0)),
          userLeftFlag = false
        )
      case None =>
        userId.copy(
          sessions = Vector(UserSession()),
          userLeftFlag = false
        )
    }
  }

  private def closeUserIdForMeetingEnd(userId: UserId, endedOn: Long, forceFlaggedIdsToLeft: Boolean): UserId = {
    userId.sessions.lastOption match {
      case Some(session) if session.leftOn > 0 => userId
      case Some(_) if !forceFlaggedIdsToLeft && userId.userLeftFlag => userId
      case Some(session) =>
        userId.copy(sessions = replaceLastItem(userId.sessions, session.copy(leftOn = endedOn)))
      case None => userId
    }
  }

  private def getNextKey(meeting: Meeting, extId: String): String = {
    val keyPrefix = extId + "-"
    val lastUsedIndex = meeting.users.values
      .filter(u => u.extId == extId)
      .flatMap(u => {
        if(u.userKey.startsWith(keyPrefix)) {
          u.userKey.stripPrefix(keyPrefix).toIntOption
        } else {
          None
        }
      })
      .foldLeft(0)(math.max)

    var nextIndex = lastUsedIndex + 1
    while(meeting.users.contains(extId + "-" + nextIndex.toString)) {
      nextIndex += 1
    }

    extId + "-" + nextIndex.toString
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
          val updatedUserId = reopenSession(userId)
          val updatedUser = user.copy(
            currentIntId = userId.intId,
            intIds = user.intIds + (userId.intId -> updatedUserId),
            lastUserDisconnectionOn = null,
          )
          val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))

          meetings += (updatedMeeting.intId -> updatedMeeting)
        }
      } else {
        val userLeftFlagged = meeting.users.values.filter(u => u.intIds.exists(uId => {
          uId._2.intId == msg.body.userId && hasOpenFlaggedSession(uId._2)
        }))

        //Flagged user must be reactivated, once UserJoinedMeetingEvtMsg won't be sent
        userLeftFlagged.lastOption.foreach { flaggedUser =>
          this.addUserToMeeting(
            msg.header.meetingId,
            msg.body.userId,
            flaggedUser.extId,
            flaggedUser.name,
            flaggedUser.isModerator,
            flaggedUser.isDialIn,
            flaggedUser.avatar,
            flaggedUser.color,
          )
        }
      }
    }
  }

  private def handleUserJoinedMeetingEvtMsg(msg: UserJoinedMeetingEvtMsg): Unit = {
    this.addUserToMeeting(
      msg.header.meetingId,
      msg.body.intId,
      msg.body.extId,
      msg.body.name,
      (msg.body.role == Roles.MODERATOR_ROLE),
      isDialIn = false,
      msg.body.avatar,
      msg.body.color)
  }

  private def handleUserLeaveReqMsg(msg: UserLeaveReqMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.body.userId)
    } yield {
      val updatedUser = user.copy(currentIntId = null)
      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))

      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handleUserLeftFlagUpdatedEvtMsg(msg: UserLeftFlagUpdatedEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByAnyIntId(meeting, msg.body.intId)
    } yield {
      val updatedUser = user.copy(
        lastUserDisconnectionOn = if(msg.body.userLeftFlag) System.currentTimeMillis() else null,
      )
      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))

      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handleUserLeftMeetingEvtMsg(msg: UserLeftMeetingEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- meeting.users.values.find(u => u.intIds.exists(uId => uId._2.intId == msg.body.intId && hasOpenSession(uId._2)))
      userId <- user.intIds.get(msg.body.intId)
    } yield {
      val updatedUserId = closeOpenSession(userId, System.currentTimeMillis()).copy(userLeftFlag = true)
      val updatedUser = user.copy(
        currentIntId = if(user.currentIntId == userId.intId) null else user.currentIntId,
        intIds = user.intIds + (userId.intId -> updatedUserId)
      )
      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))
      val mergedMeeting = mergeNextRegisteredUserAfterDisconnection(updatedMeeting, updatedUser.userKey)

      meetings += (mergedMeeting.intId -> mergedMeeting)
    }
  }

  private def handleUserRaiseHandChangedEvtMsg(msg: UserRaiseHandChangedEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.body.userId)
    } yield {
      if (msg.body.raiseHand) {
        val updatedUser = user.copy(raiseHand = user.raiseHand :+ System.currentTimeMillis())
        val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))

        meetings += (updatedMeeting.intId -> updatedMeeting)

        UserActivityDAO.insert(msg.header.meetingId, msg.header.userId, "raise-hand")
      }
    }
  }

  private def handleUserAwayChangedEvtMsg(msg: UserAwayChangedEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.body.userId)
    } yield {
      val updatedUser = if (msg.body.away) {
        if (user.away.exists(a => a.stoppedOn == 0)) {
          //do nothing if user is already away
          user
        } else {
          user.copy(away = user.away :+ Away())
        }
      } else {
        user.away.lastOption match {
          case Some(away) if away.stoppedOn == 0 =>
            user.copy(away = replaceLastItem(user.away, away.copy(stoppedOn = System.currentTimeMillis())))
          case _ =>
            //do nothing if user is not away
            user
        }
      }

      val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))
      meetings += (updatedMeeting.intId -> updatedMeeting)
    }
  }

  private def handleUserReactionEmojiChangedEvtMsg(msg: UserReactionEmojiChangedEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.body.userId)
    } yield {
      if (msg.body.reactionEmoji != "none") {
        //Ignore multiple Reactions to prevent flooding
        val hasSameReactionInLast30Seconds = user.reactions.filter(r => {
          System.currentTimeMillis() - r.sentOn < (30 * 1000) && r.name == msg.body.reactionEmoji
        }).length > 0

        if(!hasSameReactionInLast30Seconds) {
          val updatedUser = user.copy(reactions = user.reactions :+ Reaction(msg.body.reactionEmoji))
          val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))
          meetings += (updatedMeeting.intId -> updatedMeeting)
        }

        UserActivityDAO.insert(msg.header.meetingId, msg.header.userId, "reaction")
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

      UserActivityDAO.insert(msg.header.meetingId, msg.header.userId, "camera-shared")
    }
  }

  private def handleUserBroadcastCamStoppedEvtMsg(msg: UserBroadcastCamStoppedEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.body.userId)
    } yield {
      user.webcams.lastOption match {
        case Some(webcam) if webcam.stoppedOn == 0 =>
          val stoppedWebcam: Webcam = webcam.copy(stoppedOn = System.currentTimeMillis())
          val updatedUser = user.copy(webcams = replaceLastItem(user.webcams, stoppedWebcam))
          val updatedMeeting = meeting.copy(users = meeting.users + (updatedUser.userKey -> updatedUser))
          meetings += (updatedMeeting.intId -> updatedMeeting)
        case _ => // No active webcam to stop.
      }
    }
  }

  private def handleUserJoinedVoiceConfToClientEvtMsg(msg: UserJoinedVoiceConfToClientEvtMsg): Unit = {
    //Create users for Dial-in connections
    if(msg.body.intId.startsWith(IntIdPrefixType.DIAL_IN)) {
      this.addUserToMeeting(
        msg.header.meetingId,
        msg.body.intId,
        msg.body.callerName,
        msg.body.callerName,
        isModerator = false,
        isDialIn = true,
        avatar = null,
        msg.body.color)
    }
  }

  private def handleUserLeftVoiceConfToClientEvtMsg(msg: UserLeftVoiceConfToClientEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      user <- findUserByIntId(meeting, msg.body.intId)
      userId <- user.intIds.get(msg.body.intId)
    } yield {
      endUserTalk(meeting, user)

      if(user.isDialIn) {
        val updatedUserId = closeOpenSession(userId, System.currentTimeMillis())
        val updatedUser = user.copy(intIds = user.intIds + (userId.intId -> updatedUserId))
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

        UserActivityDAO.insert(msg.header.meetingId, msg.header.userId, "talking")
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
      val newPoll = Poll(
        msg.body.pollId,
        msg.body.pollType,
        msg.body.secretPoll,
        msg.body.poll.multipleResponse,
        msg.body.poll.quiz,
        msg.body.question,
        options.toVector)

      val updatedMeeting = meeting.copy(polls = meeting.polls + (newPoll.pollId -> newPoll))
      meetings += (updatedMeeting.intId -> updatedMeeting)

      UserActivityDAO.insert(msg.header.meetingId, msg.header.userId, "poll-created")
    }
  }

  private def handlePollShowResultEvtMsg(msg: PollShowResultEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      for {
        poll <- meeting.polls.find(p => p._1 == msg.body.pollId)
      } yield {
        val updatedPoll = poll._2.copy(
          published = true,
          ended = true,
          correctOption = {
            if(poll._2.quiz && msg.body.showAnswer) {
              msg.body.poll.correctAnswer.getOrElse("")
            } else {
              ""
            }
          }
        )
        val updatedMeeting = meeting.copy(polls = meeting.polls + (poll._1 -> updatedPoll))
        meetings += (updatedMeeting.intId -> updatedMeeting)
      }
    }
  }

  private def handlePollStoppedEvtMsg(msg: PollStoppedEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      for {
        poll <- meeting.polls.find(p => p._1 == msg.body.pollId)
      } yield {
        val updatedPoll = poll._2.copy(
          published = false,
          ended = true,
        )
        val updatedMeeting = meeting.copy(polls = meeting.polls + (poll._1 -> updatedPoll))
        meetings += (updatedMeeting.intId -> updatedMeeting)

        // Remove if Poll was not published
        // commented as it will be discussed
        //        if(!poll._2.published) {
        //          val updatedMeeting = meeting.copy(polls = meeting.polls.-(poll._1))
        //          meetings += (updatedMeeting.intId -> updatedMeeting)
        //        }
      }
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

        UserActivityDAO.insert(msg.header.meetingId, msg.header.userId, "poll-response")
      }
    }
  }

  private def handleScreenshareRtmpBroadcastStartedEvtMsg(msg: ScreenshareRtmpBroadcastStartedEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      val updatedMeeting = meeting.copy(screenshares = meeting.screenshares :+ Screenshare())
      meetings += (updatedMeeting.intId -> updatedMeeting)

      UserActivityDAO.insert(msg.header.meetingId, msg.body.userId, "screenshare")
    }
  }

  private def updatePluginUserDataInLadHelper(meeting: Meeting, updatedUser: User, updatedPluginUserDataCardTitles: Vector[String]): Unit = {
    val updatedMeeting = meeting.copy(
      users = meeting.users + (updatedUser.userKey -> updatedUser),
      pluginUserDataCardTitles = updatedPluginUserDataCardTitles
    )

    meetings += (updatedMeeting.intId -> updatedMeeting)
  }

  private def handlePluginLearningAnalyticsDashboardUpsertUserDataMsg(msg: PluginLearningAnalyticsDashboardUpsertUserDataMsg): Unit = {
    val targetUserId: String = if (msg.body.targetUserId.isEmpty) msg.header.userId else msg.body.targetUserId

    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      fromUser <- findUserByIntId(meeting, msg.header.userId)
      targetUser <- findUserByIntId(meeting, targetUserId)
    } yield {

      // Only moderators can alter learning-dashboard data from different user
      if (targetUserId != msg.header.userId && !fromUser.isModerator) {
        return
      }
      val currentPluginUserData = targetUser.pluginUserData.getOrElse(msg.body.userDataForLearningAnalyticsDashboard.cardTitle, Vector())
      val newPluginUserDataEntry = PluginUserData(
        msg.body.userDataForLearningAnalyticsDashboard.columnTitle,
        msg.body.userDataForLearningAnalyticsDashboard.value,
        msg.body.pluginName
      )
      val updatedUser = targetUser.copy(
        pluginUserData = targetUser.pluginUserData + (msg.body.userDataForLearningAnalyticsDashboard.cardTitle -> (currentPluginUserData :+ newPluginUserDataEntry)))

      val updatedPluginUserDataCardTitles = if(!meeting.pluginUserDataCardTitles.contains(msg.body.userDataForLearningAnalyticsDashboard.cardTitle)) {
        meeting.pluginUserDataCardTitles :+ msg.body.userDataForLearningAnalyticsDashboard.cardTitle
      } else {
        meeting.pluginUserDataCardTitles
      }

      updatePluginUserDataInLadHelper(meeting, updatedUser, updatedPluginUserDataCardTitles)
      log.debug("New user data received from a plugin '{}': {}", msg.body.pluginName,msg.body.userDataForLearningAnalyticsDashboard)
    }
  }

  private def handlePluginLearningAnalyticsDashboardDeletePluginDataMsg(msg: PluginLearningAnalyticsDashboardDeleteUserDataMsg): Unit = {
    val targetUserId: String = if (msg.body.targetUserId.isEmpty) msg.header.userId else msg.body.targetUserId

    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      fromUser <- findUserByIntId(meeting, msg.header.userId)
      targetUser <- findUserByIntId(meeting, targetUserId)
    } yield {
      // Only moderators can alter learning-dashboard data from different user
      if (targetUserId != msg.header.userId && !fromUser.isModerator) {
        return
      }

      val cardTitle = msg.body.userDataForLearningAnalyticsDashboard.cardTitle
      val columnTitle = msg.body.userDataForLearningAnalyticsDashboard.columnTitle

      val currentPluginUserData = targetUser.pluginUserData.getOrElse(cardTitle, Vector())

      // Remove entry matching columnTitle
      val filteredPluginUserData = currentPluginUserData.filterNot(_.columnTitle == columnTitle)

      val updatedPluginUserData = if (filteredPluginUserData.nonEmpty) {
        targetUser.pluginUserData + (cardTitle -> filteredPluginUserData)
      } else {
        // remove the whole card if empty
        targetUser.pluginUserData - cardTitle
      }

      val updatedUser = targetUser.copy(pluginUserData = updatedPluginUserData)

      val updatedPluginUserDataTitles =
        if (filteredPluginUserData.nonEmpty) {
          meeting.pluginUserDataCardTitles
        } else {
          meeting.pluginUserDataCardTitles.filterNot(_ == cardTitle) // remove title if card is gone
        }

      updatePluginUserDataInLadHelper(meeting, updatedUser, updatedPluginUserDataTitles)
      log.debug("Generic data deleted for plugin [{}]: {}", msg.body.pluginName, msg.body.userDataForLearningAnalyticsDashboard)
    }
  }

  private def clearAllDataFromUsers(cardTitleOpt: Option[String], pluginName: String, meeting: Meeting) = {
    meeting.users.values.map { user =>
      val updatedPluginUserData = cardTitleOpt match {

        // Case 1: cardTitle is provided – remove the entire card
        case Some(cardTitle) =>
          user.pluginUserData - cardTitle

        // Case 2: no cardTitle – remove all entries for the plugin within all cards
        case None =>
          user.pluginUserData.flatMap { case (cardTitle, pluginUserDataVector) =>
            val filteredPluginUserDataVector = pluginUserDataVector.filterNot(_.pluginName == pluginName)

            if (filteredPluginUserDataVector.nonEmpty) {
              Some(cardTitle -> filteredPluginUserDataVector)
            } else {
              None // remove card entirely if no entries remain
            }
          }
      }
      user.copy(pluginUserData = updatedPluginUserData)
    }
  }

  private def removeEmptyCardTitles(cardTitleOpt: Option[String], meeting: Meeting, updatedUsers: Iterable[User]) = {
    cardTitleOpt match {
      case Some(cardTitle) =>
        meeting.pluginUserDataCardTitles.filterNot(_ == cardTitle)
      case None =>
        // Remove any cardTitle from pluginUserDataCardTitles if it no longer exists for any user
        val remainingCardTitles = updatedUsers.flatMap(_.pluginUserData.keySet).toSet
        meeting.pluginUserDataCardTitles.filter(remainingCardTitles.contains)
    }
  }

  private def handlePluginLearningAnalyticsDashboardClearAllUsersDataMsg(msg: PluginLearningAnalyticsDashboardClearAllUsersDataMsg): Unit = {
    val cardTitleOpt: Option[String] = if (msg.body.cardTitle.isEmpty) None else Some(msg.body.cardTitle)
    val pluginName = msg.body.pluginName

    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
      fromUser <- findUserByIntId(meeting, msg.header.userId)
    } yield {
      // Only moderators can clear all users data
      if (!fromUser.isModerator) {
        return
      }

      val updatedUsers = clearAllDataFromUsers(cardTitleOpt, pluginName, meeting)

      // Update pluginUserDataCardTitles in meeting if any cards were completely removed
      val updatedPluginUserDataCardTitles: Vector[String] = removeEmptyCardTitles(cardTitleOpt, meeting, updatedUsers)

      updatedUsers.foreach { updatedUser =>
        updatePluginUserDataInLadHelper(meeting, updatedUser, updatedPluginUserDataCardTitles)
      }

      cardTitleOpt match {
        case Some(cardTitle) =>
          log.debug("Cleared LAD user data for plugin [{}] (cardTitle: [{}]) in meeting [{}]", pluginName, cardTitle, msg.header.meetingId)
        case None =>
          log.debug("Cleared LAD user data for plugin [{}] in meeting [{}]", pluginName, msg.header.meetingId)
      }
    }
  }

  private def handleScreenshareRtmpBroadcastStoppedEvtMsg(msg: ScreenshareRtmpBroadcastStoppedEvtMsg) {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.header.meetingId)
    } yield {
      meeting.screenshares.lastOption match {
        case Some(screenshare) if screenshare.stoppedOn == 0 =>
          val stoppedScreenshare: Screenshare = screenshare.copy(stoppedOn = System.currentTimeMillis())
          val updatedMeeting = meeting.copy(screenshares = replaceLastItem(meeting.screenshares, stoppedScreenshare))
          meetings += (updatedMeeting.intId -> updatedMeeting)
        case _ => // No active screenshare to stop.
      }
    }
  }

  private def handleCreateMeetingReqMsg(msg: CreateMeetingReqMsg): Unit = {
    val newMeeting = Meeting(
      msg.body.props.meetingProp.intId,
      msg.body.props.meetingProp.extId,
      msg.body.props.meetingProp.name,
      learningDashboardDisabled = msg.body.props.meetingProp.disabledFeatures.contains("learningDashboard"),
      downloadSessionDataEnabled = !msg.body.props.meetingProp.disabledFeatures.contains("learningDashboardDownloadSessionData"),
      pluginUserDataCardTitles = Vector(),
      other = Map(
        "learning-dashboard-learn-more-link"  -> msg.body.props.metadataProp.metadata.get("learning-dashboard-learn-more-link").getOrElse(""),
        "learning-dashboard-feedback-link" -> msg.body.props.metadataProp.metadata.get("learning-dashboard-feedback-link").getOrElse("")
      ),
    )

    meetings += (newMeeting.intId -> newMeeting)
    meetingAccessTokens += (newMeeting.intId -> msg.body.props.password.learningDashboardAccessToken)

    if (msg.body.props.meetingProp.disabledFeatures.contains("learningDashboard")) {
      log.info(" disabled for meeting {}.",msg.body.props.meetingProp.intId)
    }
  }

  private def mergeVectorMap[T](first: Map[String, Vector[T]], second: Map[String, Vector[T]]): Map[String, Vector[T]] = {
    second.foldLeft(first) {
      case (acc, (key, values)) => acc + (key -> (acc.getOrElse(key, Vector()) ++ values))
    }
  }

  private def mergeUserId(first: UserId, second: UserId): UserId = {
    val firstLastRegisteredOn = first.sessions.lastOption.map(_.registeredOn).getOrElse(0L)
    val secondLastRegisteredOn = second.sessions.lastOption.map(_.registeredOn).getOrElse(0L)

    first.copy(
      sessions = (first.sessions ++ second.sessions).sortBy(_.registeredOn),
      userLeftFlag = if(secondLastRegisteredOn >= firstLastRegisteredOn) second.userLeftFlag else first.userLeftFlag,
    )
  }

  private def mergeIntIds(first: Map[String, UserId], second: Map[String, UserId]): Map[String, UserId] = {
    second.foldLeft(first) {
      case (acc, (intId, userId)) =>
        acc + (intId -> acc.get(intId).map(mergeUserId(_, userId)).getOrElse(userId))
    }
  }

  private def mergeUsers(first: User, second: User): User = {
    first.copy(
      currentIntId = if(second.currentIntId != null) second.currentIntId else first.currentIntId,
      intIds = mergeIntIds(first.intIds, second.intIds),
      isModerator = second.isModerator,
      isDialIn = first.isDialIn || second.isDialIn,
      avatar = if(first.avatar == null || first.avatar.isEmpty) second.avatar else first.avatar,
      answers = mergeVectorMap(first.answers, second.answers),
      pluginUserData = mergeVectorMap(first.pluginUserData, second.pluginUserData),
      talk = Talk(
        totalTime = first.talk.totalTime + second.talk.totalTime,
        lastTalkStartedOn = if(second.talk.lastTalkStartedOn > 0) second.talk.lastTalkStartedOn else first.talk.lastTalkStartedOn,
      ),
      reactions = first.reactions ++ second.reactions,
      raiseHand = first.raiseHand ++ second.raiseHand,
      away = first.away ++ second.away,
      webcams = first.webcams ++ second.webcams,
      totalOfMessages = first.totalOfMessages + second.totalOfMessages,
      totalOfSharedNotes = first.totalOfSharedNotes + second.totalOfSharedNotes,
      totalOfWhiteboardAnnotations = first.totalOfWhiteboardAnnotations + second.totalOfWhiteboardAnnotations,
      lastUserDisconnectionOn = second.lastUserDisconnectionOn,
    )
  }

  private def findNextRegisteredUserAfterDisconnection(meeting: Meeting, user: User): Option[User] = {
    if(user.lastUserDisconnectionOn == null || userHasActiveSession(user)) {
      None
    } else {
      meeting.users.values.filter(candidate => {
        candidate.userKey != user.userKey &&
          candidate.extId == user.extId &&
          candidate.registeredInLadOn > user.lastUserDisconnectionOn
      }).toVector.sortBy(_.registeredInLadOn).headOption
    }
  }

  private def mergeNextRegisteredUserAfterDisconnection(meeting: Meeting, userKey: String): Meeting = {
    (for {
      user <- meeting.users.get(userKey)
      userToMerge <- findNextRegisteredUserAfterDisconnection(meeting, user)
    } yield {
      val mergedUser = mergeUsers(user, userToMerge)
      meeting.copy(users = (meeting.users - userToMerge.userKey) + (mergedUser.userKey -> mergedUser))
    }).getOrElse(meeting)
  }

  private def mergeAllRegisteredUsersAfterDisconnection(meeting: Meeting): Meeting = {
    val mergeableUser = meeting.users.values.toVector
      .sortBy(_.registeredInLadOn)
      .find(user => findNextRegisteredUserAfterDisconnection(meeting, user).nonEmpty)

    mergeableUser match {
      case Some(user) => mergeAllRegisteredUsersAfterDisconnection(mergeNextRegisteredUserAfterDisconnection(meeting, user.userKey))
      case None       => meeting
    }
  }

  private def handleMeetingEndingEvtMsg(msg: MeetingEndingEvtMsg): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == msg.body.meetingId)
    } yield {
      //Update endedOn and screenshares.stoppedOn, user.totalTime talks, webcams.stoppedOn
      val endedOn : Long = System.currentTimeMillis()
      val meetingWithLeftProps = meeting.copy(
        endedOn = endedOn,
        screenshares = meeting.screenshares.map { screenshare =>
          if(screenshare.stoppedOn > 0) screenshare
          else screenshare.copy(stoppedOn = endedOn)
        },
        users = meeting.users.map { case (userKey, user) =>
          userKey -> userWithLeftProps(user, endedOn)
        }
      )
      val updatedMeeting = mergeAllRegisteredUsersAfterDisconnection(meetingWithLeftProps)

      meetings += (updatedMeeting.intId -> updatedMeeting)

      //Send report one last time
      sendReportSafely(updatedMeeting)

      meetings = meetings.-(updatedMeeting.intId)
      meetingPresentations = meetingPresentations.-(updatedMeeting.intId)
      meetingAccessTokens = meetingAccessTokens.-(updatedMeeting.intId)
      meetingExcludedFromDashboardUserIds = meetingExcludedFromDashboardUserIds.-(updatedMeeting.intId)
      meetingsLastJsonHash = meetingsLastJsonHash.-(updatedMeeting.intId)
      log.info(" removed for meeting {}.",updatedMeeting.intId)
    }
  }

  private def userWithLeftProps(user: User, endedOn: Long, forceFlaggedIdsToLeft: Boolean = true): User = {
    user.copy(
      currentIntId = null,
      intIds = user.intIds.map { case (intId, userId) =>
        intId -> closeUserIdForMeetingEnd(userId, endedOn, forceFlaggedIdsToLeft)
      },
      talk = user.talk.copy(
        totalTime = user.talk.totalTime + (if (user.talk.lastTalkStartedOn > 0) (endedOn - user.talk.lastTalkStartedOn) else 0),
        lastTalkStartedOn = 0
      ),
      webcams = user.webcams.map { webcam =>
        if(webcam.stoppedOn > 0) webcam
        else webcam.copy(stoppedOn = endedOn)
      }
    )
  }

  private def addUserToMeeting(meetingIntId: String, intId: String, extId: String, name: String, isModerator: Boolean, isDialIn: Boolean, avatar: String, color: String): Unit = {
    for {
      meeting <- meetings.values.find(m => m.intId == meetingIntId)
    } yield {
      if(!meetingExcludedFromDashboardUserIds.getOrElse(meeting.intId, Vector()).contains(intId)) {
        val currentTime = System.currentTimeMillis()

        val existingOrNewUser: User =
          findUserByIntId(meeting, intId).getOrElse(
            findUserByExtId(meeting, extId, onlyIfLeft = true).getOrElse({
              User(
                getNextKey(meeting, extId),
                extId,
                Map(),
                name,
                isModerator,
                color,
                isDialIn,
                avatar match {
                  case "" => null
                  case a => a
                },
                currentIntId = intId,
              )
            })
          )

        val user: User = userWithLeftProps(existingOrNewUser, currentTime, forceFlaggedIdsToLeft = false)

        // Close this user's current session before appending the new one below. This user
        // is added back after the map, so it would otherwise reintroduce the open session.
        val currentUserId = closeOpenSession(
          user.intIds.get(intId).getOrElse(UserId(intId, sessions = Vector())),
          currentTime
        )

        // Close any other stored user entry with the same internal id before storing the new session.
        val usersWithClosedPreviousSessions = meeting.users.map { case (userKey, existingUser) =>
          val updatedIntIds = existingUser.intIds.map { case (existingIntId, existingUserId) =>
            val updatedUserId =
              if (existingUserId.intId == intId && hasOpenSession(existingUserId)) {
                closeOpenSession(existingUserId, currentTime)
              } else {
                existingUserId
              }

            existingIntId -> updatedUserId
          }

          userKey -> existingUser.copy(
            intIds = updatedIntIds
          )
        }

        val updatedUser = user.copy(
          currentIntId = intId,
          lastUserDisconnectionOn = null,
          intIds = user.intIds + (intId -> currentUserId.copy(
            sessions = currentUserId.sessions :+ UserSession(currentTime),
            userLeftFlag = false
          ))
        )

        meetings += (meeting.intId -> meeting.copy(
          users = usersWithClosedPreviousSessions + (updatedUser.userKey -> updatedUser)
        ))
      }
    }
  }

  private def sendPeriodicReport(): Unit = {
    meetings.values.foreach(sendReportSafely)
  }

  private def sendReportSafely(meeting: Meeting): Unit = {
    try {
      sendReport(meeting)
    } catch {
      case NonFatal(e) =>
        log.error(e, "Failed to send Learning Dashboard report for meeting {}.", meeting.intId)
    }
  }

  private def sendReport(meeting : Meeting): Unit = {
    if(!meeting.learningDashboardDisabled) {
      val activityJson: String = JsonUtil.toJson(meeting)

      //Avoid send repeated activity jsons
      val activityJsonHash : String = MessageDigest.getInstance("MD5").digest(activityJson.getBytes).mkString
      if(!meetingsLastJsonHash.contains(meeting.intId) || meetingsLastJsonHash.getOrElse(meeting.intId, "") != activityJsonHash) {
        for {
          learningDashboardAccessToken <- meetingAccessTokens.get(meeting.intId)
        } yield {
          val event = MsgBuilder.buildLearningDashboardEvtMsg(meeting.intId, learningDashboardAccessToken, activityJson)
          outGW.send(event)
          meetingsLastJsonHash += (meeting.intId -> activityJsonHash)

          log.debug("Learning Dashboard data sent for meeting {}", meeting.intId)
        }
      }
    }
  }

}
