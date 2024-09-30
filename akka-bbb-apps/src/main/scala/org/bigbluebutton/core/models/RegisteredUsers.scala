package org.bigbluebutton.core.models

import com.softwaremill.quicklens._
import org.bigbluebutton.core.db.{UserBreakoutRoomDAO, UserDAO, UserDbModel, UserSessionTokenDAO}
import org.bigbluebutton.core.domain.BreakoutRoom2x

object RegisteredUsers {
  def create(meetingId: String, userId: String, extId: String, name: String, roles: String,
             authToken: String, sessionToken: Vector[String], avatar: String, webcamBackground: String, color: String, guest: Boolean, authenticated: Boolean,
             guestStatus: String, excludeFromDashboard: Boolean, enforceLayout: String,
             userMetadata: Map[String, String], loggedOut: Boolean): RegisteredUser = {
    new RegisteredUser(
      userId,
      extId,
      meetingId,
      name,
      roles,
      authToken,
      sessionToken,
      avatar,
      webcamBackground,
      color,
      guest,
      authenticated,
      guestStatus,
      excludeFromDashboard,
      System.currentTimeMillis(),
      lastAuthTokenValidatedOn = 0,
      graphqlConnected = false,
      graphqlDisconnectedOn = 0,
      joined = false,
      ejected = false,
      banned = false,
      enforceLayout,
      userMetadata,
      loggedOut,
    )
  }

  def findWithToken(token: String, users: RegisteredUsers): Option[RegisteredUser] = {
    users.toVector.find(u => u.authToken == token)
  }

  def findWithSessionToken(sessionToken: String, users: RegisteredUsers): Option[RegisteredUser] = {
    users.toVector.find(u => u.sessionToken.contains(sessionToken))
  }

  def findAll(users: RegisteredUsers): Vector[RegisteredUser] = {
    users.toVector
  }

  def findWithUserId(id: String, users: RegisteredUsers): Option[RegisteredUser] = {
    users.toVector.find(ru => id == ru.id)
  }

  def findWithExternUserId(id: String, users: RegisteredUsers): Option[RegisteredUser] = {
    users.toVector.find(ru => id == ru.externId)
  }

  def findAllWithExternUserId(id: String, users: RegisteredUsers): Vector[RegisteredUser] = {
    users.toVector.filter(ru => id == ru.externId)
  }

  def findWithBreakoutRoomId(breakoutRoomId: String, users: RegisteredUsers): Vector[RegisteredUser] = {
    //userId + "-" + roomSequence
    val userIdParts = breakoutRoomId.split("-")
    val userExtId = userIdParts(0)
    users.toVector.filter(ru => userExtId == ru.externId)
  }

  def getRegisteredUserWithToken(token: String, userId: String, regUsers: RegisteredUsers): Option[RegisteredUser] = {
    def isSameUserId(ru: RegisteredUser, userId: String): Option[RegisteredUser] = {
      if (userId.startsWith(ru.id)) {
        Some(ru)
      } else {
        None
      }
    }

    for {
      ru <- RegisteredUsers.findWithToken(token, regUsers)
      user <- isSameUserId(ru, userId)
    } yield user
  }

  def checkUserExtIdHasJoined(externId: String, regUsers: RegisteredUsers): Boolean = {
    regUsers.toVector.filter(_.externId == externId).filter(_.joined).length > 0
  }

  def numUniqueJoinedUsers(regUsers: RegisteredUsers): Int = {
    regUsers.toVector.filter(_.joined).map(_.externId).distinct.length
  }

  def numRegisteredUsers(regUsers: RegisteredUsers): Int = {
    regUsers.toVector.size
  }

  def add(users: RegisteredUsers, user: RegisteredUser, meetingId: String): Vector[RegisteredUser] = {

    findWithExternUserId(user.externId, users) match {
      case Some(u) =>
        if (u.banned) {
          // Banned user is rejoining. Don't add so that validate token
          // will fail and can't join.
          // ralam april 21, 2020
          val bannedUser = user.copy(banned = true)
          UserDAO.insert(meetingId, bannedUser)
          users.save(bannedUser)
        } else {
          // If user hasn't been ejected, we allow user to join
          // as the user might be joining using 2 browsers for
          // better management of meeting.
          // ralam april 21, 2020
          UserDAO.insert(meetingId, user)
          users.save(user)
        }
      case None =>
        UserDAO.insert(meetingId, user)
        users.save(user)
    }
  }

  private def banOrEjectUser(ejectedUser: RegisteredUser, users: RegisteredUsers, ban: Boolean): RegisteredUser = {
    // Some users join with multiple browser to manage the meeting.
    // Don't black list a user ejecting oneself.
    // ralam april 23, 2020
    if (ban) {
      // Set a flag that user has been ejected. We flag the user instead of
      // removing so we can eject when user tries to rejoin with the same
      // external userid.
      // ralam april 21, 2020
      val u = ejectedUser.modify(_.banned).setTo(true)
      users.save(u)
      UserDAO.update(u)
      u
    } else {
      val u = ejectedUser.modify(_.ejected).setTo(true)
      users.save(u)

      updateUserJoin(users, u, joined = false)
    }
  }

  def eject(userId: String, users: RegisteredUsers, ban: Boolean): Option[RegisteredUser] = {
    for {
      ru <- findWithUserId(userId, users)
    } yield {
      banOrEjectUser(ru, users, ban)
    }
  }

  def setWaitingForApproval(users: RegisteredUsers, user: RegisteredUser,
                            guestStatus: String): RegisteredUser = {
    val u = user.modify(_.guestStatus).setTo(guestStatus)
    users.save(u)
    UserDAO.update(u)
    u
  }

  def updateUserRole(users: RegisteredUsers, user: RegisteredUser,
                     role: String): RegisteredUser = {
    val u = user.modify(_.role).setTo(role)
    users.save(u)
    UserDAO.update(u)
    u
  }

  def updateUserLastBreakoutRoom(users: RegisteredUsers, user: RegisteredUser,
                                 lastBreakoutRoom: BreakoutRoom2x): RegisteredUser = {
    val u = user.modify(_.lastBreakoutRoom).setTo(lastBreakoutRoom)
    users.save(u)
//    UserBreakoutRoomDAO.updateLastBreakoutRoom(u.id, lastBreakoutRoom)
    u
  }

  def updateUserJoin(users: RegisteredUsers, user: RegisteredUser, joined: Boolean): RegisteredUser = {
    val u = user.copy(joined = joined)
    users.save(u)
    UserDAO.update(u)
    u
  }

  def updateUserLastAuthTokenValidated(users: RegisteredUsers, user: RegisteredUser): RegisteredUser = {
    val u = user.copy(lastAuthTokenValidatedOn = System.currentTimeMillis())
    users.save(u)
    u
  }

  def updateUserConnectedToGraphql(users: RegisteredUsers, user: RegisteredUser, graphqlConnected: Boolean): RegisteredUser = {
    val u = user.copy(
      graphqlConnected = graphqlConnected,
      graphqlDisconnectedOn = {
        if(graphqlConnected) {
          0
        } else if(!graphqlConnected && user.graphqlDisconnectedOn == 0) {
          System.currentTimeMillis()
        } else {
          user.graphqlDisconnectedOn
        }
      }
    )
    users.save(u)
    u
  }

  def setUserLoggedOutFlag(users: RegisteredUsers, user: RegisteredUser): RegisteredUser = {
    val u = user.copy(loggedOut = true)
    users.save(u)
    UserDAO.update(u)
    u
  }

  def addUserSessionToken(users: RegisteredUsers, user: RegisteredUser, newSessionToken: String, enforceLayout: String): RegisteredUser = {
    val u = user.copy(sessionToken = user.sessionToken :+ newSessionToken)
    users.save(u)
    UserSessionTokenDAO.insert(u.meetingId, u.id, newSessionToken, enforceLayout)
    u
  }

  def removeUserSessionToken(users: RegisteredUsers, user: RegisteredUser, replaceSessionToken: String): RegisteredUser = {
    val u = user.copy(sessionToken = user.sessionToken.filterNot(_ == replaceSessionToken))
    users.save(u)
    UserSessionTokenDAO.softDelete(u.meetingId, u.id, replaceSessionToken)
    u
  }

}

class RegisteredUsers {
  private var regUsers = new collection.immutable.HashMap[String, RegisteredUser]

  private def toVector: Vector[RegisteredUser] = regUsers.values.toVector

  private def save(user: RegisteredUser): Vector[RegisteredUser] = {
    regUsers += user.authToken -> user
    regUsers.values.toVector
  }

  private def delete(id: String): Option[RegisteredUser] = {
    val ru = regUsers.values.find(p => p.id == id)
    ru foreach { u =>
      regUsers -= u.authToken
    }
    ru
  }
}

case class RegisteredUser(
    id:                       String,
    externId:                 String,
    meetingId:                String,
    name:                     String,
    role:                     String,
    authToken:                String,
    sessionToken:             Vector[String],
    avatarURL:                String,
    webcamBackgroundURL:      String,
    color:                    String,
    guest:                    Boolean,
    authed:                   Boolean,
    guestStatus:              String,
    excludeFromDashboard:     Boolean,
    registeredOn:             Long,
    lastAuthTokenValidatedOn: Long,
    graphqlConnected:         Boolean,
    graphqlDisconnectedOn:    Long,
    joined:                   Boolean,
    ejected:                  Boolean,
    banned:                   Boolean,
    enforceLayout:            String,
    userMetadata:         Map[String,String],
    loggedOut:                Boolean,
    lastBreakoutRoom:         BreakoutRoom2x = null,
)

