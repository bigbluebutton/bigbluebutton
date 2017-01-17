package org.bigbluebutton.core.running.handlers

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.running.MeetingActor

import scala.collection.immutable.ListSet

trait UserJoinMsgHdlr {
  this: MeetingActor =>

  def handleUserJoin(msg: UserJoining): Unit = {
    log.debug("Received user joined meeting. metingId=" + state.mProps.meetingID + " userId=" + msg.userID)

    val regUser = state.usersModel.getRegisteredUserWithToken(msg.authToken)
    regUser foreach { ru =>
      log.debug("Found registered user. metingId=" + state.mProps.meetingID + " userId=" + msg.userID + " ru=" + ru)

      val wUser = state.usersModel.getUser(msg.userID)

      val vu = wUser match {
        case Some(u) => {
          log.debug("Found  user. metingId=" + state.mProps.meetingID + " userId=" + msg.userID + " user=" + u)
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
          log.debug("User not found. metingId=" + state.mProps.meetingID + " userId=" + msg.userID)
          /**
           * New user. Initialize voice status.
           */
          new VoiceUser(msg.userID, msg.userID, ru.name, ru.name,
            joined = false, locked = false,
            muted = false, talking = false, ru.avatarURL, listenOnly = false)
        }
      }

      wUser.foreach { w =>
        if (!w.joinedWeb) {
          log.debug("User is in voice only. Mark as user left. metingId=" + state.mProps.meetingID + " userId=" + msg.userID)
          /**
           * If user is not joined through the web (perhaps reconnecting).
           * Send a user left event to clear up user list of all clients.
           */
          val user = state.usersModel.removeUser(w.userID)
          outGW.send(new UserLeft(msg.meetingID, state.mProps.recorded, w))
        }
      }

      /**
       * Initialize the newly joined user copying voice status in case this
       * join is due to a reconnect.
       */
      val uvo = new UserVO(msg.userID, ru.externId, ru.name,
        ru.role, emojiStatus = "none", presenter = false,
        hasStream = false, locked = getInitialLockStatus(ru.role),
        webcamStreams = new ListSet[String](), phoneUser = false, vu,
        listenOnly = vu.listenOnly, avatarURL = vu.avatarURL, joinedWeb = true)

      state.usersModel.addUser(uvo)

      log.info("User joined meeting. metingId=" + state.mProps.meetingID + " userId=" + uvo.userID + " user=" + uvo)

      outGW.send(new UserJoined(state.mProps.meetingID, state.mProps.recorded, uvo))
      outGW.send(new MeetingState(state.mProps.meetingID, state.mProps.recorded, uvo.userID, state.meetingModel.getPermissions(), state.meetingModel.isMeetingMuted()))

      // Become presenter if the only moderator
      if ((state.usersModel.numModerators == 1) || (state.usersModel.noPresenter())) {
        if (ru.role == Role.MODERATOR) {
          assignNewPresenter(msg.userID, ru.name, msg.userID)
        }
      }
      webUserJoined
      startRecordingIfAutoStart()
    }
  }
}
