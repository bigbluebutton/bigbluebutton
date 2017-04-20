package org.bigbluebutton.core.apps

import org.bigbluebutton.core.util.RandomStringGenerator
import org.bigbluebutton.core.api.Presenter
import org.bigbluebutton.core.models._

class UsersModel {
  private var uservos = new Users

  private var regUsers = new RegisteredUsers

  /* When reconnecting SIP global audio, users may receive the connection message
   * before the disconnection message.
   * This variable is a connection counter that should control this scenario.
   */
  private var globalAudioConnectionCounter = new collection.immutable.HashMap[String, Integer]

  private var locked = false
  private var meetingMuted = false
  private var recordingVoice = false

  private var currentPresenter = new Presenter("system", "system", "system")

  def setCurrentPresenterInfo(pres: Presenter) {
    currentPresenter = pres
  }

  def getCurrentPresenterInfo(): Presenter = {
    currentPresenter
  }

  def addRegisteredUser(token: String, regUser: RegisteredUser) {
    regUsers.save(regUser)
  }

  def getRegisteredUserWithToken(token: String, userId: String): Option[RegisteredUser] = {

    def isSameUserId(ru: RegisteredUser, userId: String): Option[RegisteredUser] = {
      if (userId.startsWith(ru.id)) {
        Some(ru)
      } else {
        None
      }
    }

    for {
      ru <- RegisteredUsers.findWithToken(token, regUsers.toVector)
      user <- isSameUserId(ru, userId)
    } yield user

  }

  def generateWebUserId: String = {
    val webUserId = RandomStringGenerator.randomAlphanumericString(6)
    if (!hasUser(webUserId)) webUserId else generateWebUserId
  }

  def addUser(uvo: UserVO) {
    uservos.save(uvo)
  }

  def removeUser(userId: String): Option[UserVO] = {
    val user = Users.findWithId(userId, uservos.toVector)
    user foreach (u => uservos.remove(userId))

    user
  }

  def hasSessionId(sessionId: String): Boolean = {
    Users.hasSessionId(sessionId, uservos.toVector)
  }

  def hasUser(userID: String): Boolean = {
    Users.hasUserWithId(userID, uservos.toVector)
  }

  def numUsers(): Int = {
    Users.numUsers(uservos.toVector)
  }

  def numWebUsers(): Int = {
    Users.numWebUsers(uservos.toVector)
  }

  def numUsersInVoiceConference: Int = {
    Users.numUsersInVoiceConference(uservos.toVector)
  }

  def getUserWithExternalId(userID: String): Option[UserVO] = {
    Users.findWithExtId(userID, uservos.toVector)
  }

  def getUserWithVoiceUserId(voiceUserId: String): Option[UserVO] = {
    Users.getUserWithVoiceUserId(voiceUserId, uservos.toVector)
  }

  def getUser(userID: String): Option[UserVO] = {
    Users.findWithId(userID, uservos.toVector)
  }

  def getUsers(): Array[UserVO] = {
    uservos.toVector.toArray
  }

  def numModerators(): Int = {
    Users.numModerators(uservos.toVector)
  }

  def findAModerator(): Option[UserVO] = {
    Users.findAModerator(uservos.toVector)
  }

  def noPresenter(): Boolean = {
    Users.hasNoPresenter(uservos.toVector)
  }

  def getCurrentPresenter(): Option[UserVO] = {
    Users.getCurrentPresenter(uservos.toVector)
  }

  def unbecomePresenter(userID: String) = {
    for {
      u <- Users.findWithId(userID, uservos.toVector)
      user = Users.unbecomePresenter(u)
    } yield uservos.save(user)
  }

  def becomePresenter(userID: String) = {
    for {
      u <- Users.findWithId(userID, uservos.toVector)
      user = Users.becomePresenter(u)
    } yield uservos.save(user)
  }

  def getModerators(): Array[UserVO] = {
    Users.findModerators(uservos.toVector).toArray
  }

  def getViewers(): Array[UserVO] = {
    Users.findViewers(uservos.toVector).toArray
  }

  def isModerator(userId: String): Boolean = {
    Users.isModerator(userId, uservos.toVector)
  }

  def getRegisteredUserWithUserID(userID: String): Option[RegisteredUser] = {
    RegisteredUsers.findWithUserId(userID, regUsers.toVector)
  }

  def removeRegUser(userID: String) {
    regUsers.delete(userID)
  }

  def updateRegUser(uvo: UserVO) {
    for {
      ru <- RegisteredUsers.findWithUserId(uvo.id, regUsers.toVector)
      regUser = new RegisteredUser(uvo.id, uvo.externalId, uvo.name, uvo.role, ru.authToken,
        uvo.avatarURL, uvo.guest, uvo.authed, uvo.waitingForAcceptance)
    } yield regUsers.save(regUser)
  }

  def addGlobalAudioConnection(userID: String): Boolean = {
    globalAudioConnectionCounter.get(userID) match {
      case Some(vc) => {
        globalAudioConnectionCounter += userID -> (vc + 1)
        false
      }
      case None => {
        globalAudioConnectionCounter += userID -> 1
        true
      }
    }
  }

  def removeGlobalAudioConnection(userID: String): Boolean = {
    globalAudioConnectionCounter.get(userID) match {
      case Some(vc) => {
        if (vc == 1) {
          globalAudioConnectionCounter -= userID
          true
        } else {
          globalAudioConnectionCounter += userID -> (vc - 1)
          false
        }
      }
      case None => {
        false
      }
    }
  }

  def startRecordingVoice() {
    recordingVoice = true
  }

  def stopRecordingVoice() {
    recordingVoice = false
  }

  def isVoiceRecording: Boolean = {
    recordingVoice
  }
}