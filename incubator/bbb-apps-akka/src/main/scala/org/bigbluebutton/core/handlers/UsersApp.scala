package org.bigbluebutton.core.handlers

import org.bigbluebutton.core.domain._
import scala.collection.immutable.ListSet
import org.bigbluebutton.core.LiveMeeting

trait UsersApp {
  this: LiveMeeting =>

  def becomePresenterIfOnlyModerator(userId: IntUserId, name: Name, roles: Set[String]) {
    if ((meeting.numModerators == 1) || (meeting.noPresenter())) {
      if (roles.contains(Role.MODERATOR)) {
        assignNewPresenter(userId, name, userId)
      }
    }
  }

  def changeUserEmojiStatus(userId: IntUserId, emojiStatus: EmojiStatus): Option[UserVO] = {
    val vu = for {
      user <- meeting.getUser(userId)
      uvo = user.copy(emojiStatus = emojiStatus)
    } yield uvo

    vu foreach { u =>
      meeting.saveUser(u)
    }

    vu
  }

  def createNewUser(userId: IntUserId, externId: ExtUserId,
    name: Name, roles: Set[String],
    voiceUser: VoiceUser, locked: Boolean): UserVO = {
    // Initialize the newly joined user copying voice status in case this
    // join is due to a reconnect.
    val uvo = new UserVO(userId, externId, name,
      roles, emojiStatus = EmojiStatus("none"), presenter = IsPresenter(false),
      hasStream = HasStream(false), locked = Locked(locked),
      webcamStreams = new ListSet[String](), phoneUser = PhoneUser(false), voiceUser,
      listenOnly = voiceUser.listenOnly, joinedWeb = JoinedWeb(true))
    meeting.saveUser(uvo)
    uvo
  }

  def initializeVoice(userId: IntUserId, username: Name): VoiceUser = {
    val wUser = meeting.getUser(userId)

    val vu = wUser match {
      case Some(u) => {
        if (u.voiceUser.joinedVoice.value) {
          // User is in voice conference. Must mean that the user reconnected with audio
          // still in the voice conference.
          u.voiceUser.copy()
        } else {
          // User is not joined in voice conference. Initialize user and copy status
          // as user maybe joined listenOnly.
          val callerId = CallerId(CallerIdName(username.value), CallerIdNum(username.value))
          new VoiceUser(u.voiceUser.id, userId, callerId,
            joinedVoice = JoinedVoice(false), locked = Locked(false), muted = Muted(false),
            talking = Talking(false), listenOnly = u.listenOnly)
        }
      }
      case None => {
        // New user. Initialize voice status.
        val callerId = CallerId(CallerIdName(username.value), CallerIdNum(username.value))
        new VoiceUser(VoiceUserId(userId.value), userId, callerId,
          joinedVoice = JoinedVoice(false), locked = Locked(false),
          muted = Muted(false), talking = Talking(false), listenOnly = ListenOnly(false))
      }
    }

    vu
  }
}