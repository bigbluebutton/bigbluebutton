package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.util.ColorPicker
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, Sender }

trait RegisterUserReqMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleRegisterUserReqMsg(msg: RegisterUserReqMsg): Unit = {

    def buildUserRegisteredRespMsg(meetingId: String, userId: String, name: String,
                                   role: String, excludeFromDashboard: Boolean, registeredOn: Long): BbbCommonEnvCoreMsg = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(UserRegisteredRespMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(UserRegisteredRespMsg.NAME, meetingId)
      val body = UserRegisteredRespMsgBody(meetingId, userId, name, role, excludeFromDashboard, registeredOn)
      val event = UserRegisteredRespMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    def checkUserConcurrentAccesses(regUser: RegisteredUser): Unit = {
      //Remove concurrent accesses over the limit
      if (liveMeeting.props.usersProp.maxUserConcurrentAccesses > 0) {
        val userConcurrentAccesses = RegisteredUsers.findAllWithExternUserId(regUser.externId, liveMeeting.registeredUsers)
          .filter(u => !u.loggedOut)
          .sortWith((u1, u2) => u1.registeredOn > u2.registeredOn) //Remove older first

        val userAvailableSlots = liveMeeting.props.usersProp.maxUserConcurrentAccesses - userConcurrentAccesses.length
        if (userAvailableSlots <= 0) {
          (liveMeeting.props.usersProp.maxUserConcurrentAccesses to userConcurrentAccesses.length) foreach {
            idxUserToRemove =>
              {
                val userToRemove = userConcurrentAccesses(idxUserToRemove - 1)
                val meetingId = liveMeeting.props.meetingProp.intId

                log.info(s"User ${regUser.id} with extId=${regUser.externId} has ${userConcurrentAccesses.length} concurrent accesses and limit is ${liveMeeting.props.usersProp.maxUserConcurrentAccesses}. " +
                  s"Ejecting the oldest=${userToRemove.id} in meetingId=${meetingId}")

                val reason = "user ejected because of duplicate external userid"
                UsersApp.ejectUserFromMeeting(outGW, liveMeeting, userToRemove.id, SystemUser.ID, reason, EjectReasonCode.DUPLICATE_USER, ban = false)

                // send a system message to force disconnection
                Sender.sendDisconnectClientSysMsg(meetingId, userToRemove.id, SystemUser.ID, EjectReasonCode.DUPLICATE_USER, outGW)
              }
          }
        }
      }
    }

    val guestStatus = msg.body.guestStatus

    val regUser = RegisteredUsers.create(msg.body.intUserId, msg.body.extUserId,
      msg.body.name, msg.body.role, msg.body.authToken,
      msg.body.avatarURL, ColorPicker.nextColor(liveMeeting.props.meetingProp.intId), msg.body.guest, msg.body.authed, guestStatus, msg.body.excludeFromDashboard, false)

    checkUserConcurrentAccesses(regUser)

    RegisteredUsers.add(liveMeeting.registeredUsers, regUser)

    log.info("Register user success. meetingId=" + liveMeeting.props.meetingProp.intId
      + " userId=" + msg.body.extUserId + " user=" + regUser)

    val event = buildUserRegisteredRespMsg(liveMeeting.props.meetingProp.intId, regUser.id, regUser.name,
      regUser.role, regUser.excludeFromDashboard, regUser.registeredOn)
    outGW.send(event)

    def notifyModeratorsOfGuestWaiting(guests: Vector[GuestWaiting], users: Users2x, meetingId: String): Unit = {
      val mods = Users2x.findAll(users).filter(p => p.role == Roles.MODERATOR_ROLE && p.clientType == ClientType.FLASH)
      mods foreach { m =>
        val event = MsgBuilder.buildGuestsWaitingForApprovalEvtMsg(meetingId, m.intId, guests)
        outGW.send(event)
      }
      // Meteor should only listen for this single message
      val event = MsgBuilder.buildGuestsWaitingForApprovalEvtMsg(meetingId, "nodeJSapp", guests)
      outGW.send(event)
    }

    def addGuestToWaitingForApproval(guest: GuestWaiting, guestsWaitingList: GuestsWaiting): Unit = {
      GuestsWaiting.add(guestsWaitingList, guest)
    }

    guestStatus match {
      case GuestStatus.ALLOW =>
        val g = GuestApprovedVO(regUser.id, GuestStatus.ALLOW)
        UsersApp.approveOrRejectGuest(liveMeeting, outGW, g, SystemUser.ID)
      case GuestStatus.WAIT =>
        val guest = GuestWaiting(regUser.id, regUser.name, regUser.role, regUser.guest, regUser.avatarURL, regUser.color, regUser.authed, regUser.registeredOn)
        addGuestToWaitingForApproval(guest, liveMeeting.guestsWaiting)
        notifyModeratorsOfGuestWaiting(Vector(guest), liveMeeting.users2x, liveMeeting.props.meetingProp.intId)
        val notifyEvent = MsgBuilder.buildNotifyRoleInMeetingEvtMsg(
          Roles.MODERATOR_ROLE,

          liveMeeting.props.meetingProp.intId,
          "info",
          "user",
          "app.userList.guest.pendingGuestAlert",
          "Notification that a new guest user joined the session",
          Vector(s"${regUser.name}")
        )
        outGW.send(notifyEvent)
      case GuestStatus.DENY =>
        val g = GuestApprovedVO(regUser.id, GuestStatus.DENY)
        UsersApp.approveOrRejectGuest(liveMeeting, outGW, g, SystemUser.ID)
    }

  }
}
