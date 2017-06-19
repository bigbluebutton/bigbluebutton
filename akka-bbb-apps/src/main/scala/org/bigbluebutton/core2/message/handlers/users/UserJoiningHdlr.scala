package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait UserJoiningHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway
  def handleUserJoin(msg: UserJoining): Unit = {
    log.debug("Received user joined meeting. metingId=" + props.meetingProp.intId + " userId=" + msg.userID)

    def initVoiceUser(userId: String, ru: RegisteredUser): VoiceUser = {
      val wUser = Users.findWithId(userId, liveMeeting.users)

      wUser match {
        case Some(u) => {
          log.debug("Found  user. metingId=" + props.meetingProp.intId + " userId=" + msg.userID + " user=" + u)
          if (u.voiceUser.joined) {
            /*
             * User is in voice conference. Must mean that the user reconnected with audio
             * still in the voice conference.
             */
            u.voiceUser.copy()
          } else {
            /**
             * User is not joined in voice conference. Initialize user and copy status
             * as user maybe joined listenOnly.
             */
            new VoiceUser(u.voiceUser.userId, msg.userID, ru.name, ru.name,
              joined = false, locked = false, muted = false,
              talking = false, u.avatarURL, listenOnly = u.listenOnly)
          }
        }
        case None => {
          log.debug("User not found. metingId=" + props.meetingProp.intId + " userId=" + msg.userID)
          /**
           * New user. Initialize voice status.
           */
          new VoiceUser(msg.userID, msg.userID, ru.name, ru.name,
            joined = false, locked = false,
            muted = false, talking = false, ru.avatarURL, listenOnly = false)
        }
      }
    }

    val regUser = RegisteredUsers.getRegisteredUserWithToken(msg.authToken, msg.userID, liveMeeting.registeredUsers)
    regUser foreach { ru =>
      log.debug("Found registered user. metingId=" + props.meetingProp.intId + " userId=" + msg.userID + " ru=" + ru)

      val wUser = Users.findWithId(msg.userID, liveMeeting.users)

      val vu = initVoiceUser(msg.userID, ru)

      wUser.foreach { w =>
        if (!w.joinedWeb) {
          log.debug("User is in voice only. Mark as user left. metingId=" + props.meetingProp.intId + " userId=" + msg.userID)
          /**
           * If user is not joined through the web (perhaps reconnecting).
           * Send a user left event to clear up user list of all clients.
           */
          Users.userLeft(w.id, liveMeeting.users)
          outGW.send(new UserLeft(msg.meetingID, props.recordProp.record, w))
        }
      }

      /**
       * Initialize the newly joined user copying voice status in case this
       * join is due to a reconnect.
       */
      val waitingForAcceptance = ru.guest &&
        MeetingStatus2x.getGuestPolicy(liveMeeting.status) == GuestPolicy.ASK_MODERATOR && ru.waitingForAcceptance
      val lockStatus = getInitialLockStatus(ru.role)

      for {
        uvo <- Users.newUser(msg.userID, lockStatus, ru, waitingForAcceptance, vu, liveMeeting.users)
      } yield {
        log.info("User joined meeting. metingId=" + props.meetingProp.intId + " userId=" + uvo.id + " user=" + uvo)

        if (uvo.guest && MeetingStatus2x.getGuestPolicy(liveMeeting.status) == GuestPolicy.ALWAYS_DENY) {
          outGW.send(new GuestAccessDenied(props.meetingProp.intId, props.recordProp.record, uvo.id))
        } else {
          outGW.send(new UserJoined(props.meetingProp.intId, props.recordProp.record, uvo))
          outGW.send(new MeetingState(props.meetingProp.intId, props.recordProp.record, uvo.id,
            MeetingStatus2x.getPermissions(liveMeeting.status), MeetingStatus2x.isMeetingMuted(liveMeeting.status)))

          if (!waitingForAcceptance) {
            // Become presenter if the only moderator
            if ((Users.numModerators(liveMeeting.users) == 1) || (Users.hasNoPresenter(liveMeeting.users))) {
              if (ru.role == Roles.MODERATOR_ROLE) {
                log.info("Assigning presenter to lone moderator. metingId=" + props.meetingProp.intId + " userId=" + uvo.id)
                assignNewPresenter(msg.userID, ru.name, msg.userID)
              }
            }
          } else {
            log.info("User waiting for acceptance. metingId=" + props.meetingProp.intId + " userId=" + uvo.id)
          }
          liveMeeting.webUserJoined
          startRecordingIfAutoStart()
        }
      }
    }
  }
}
