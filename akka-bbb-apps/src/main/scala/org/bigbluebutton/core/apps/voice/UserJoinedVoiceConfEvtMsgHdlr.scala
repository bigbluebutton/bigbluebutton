package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.db.NotificationDAO
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter, HandlerHelpers }
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.util.ColorPicker
import org.bigbluebutton.core2.MeetingStatus2x

trait UserJoinedVoiceConfEvtMsgHdlr extends SystemConfiguration with HandlerHelpers {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserJoinedVoiceConfEvtMsg(msg: UserJoinedVoiceConfEvtMsg): Unit = {

    val guestPolicy = GuestsWaiting.getGuestPolicy(liveMeeting.guestsWaiting)
    val isDialInUser = msg.body.intId.startsWith(IntIdPrefixType.DIAL_IN)
    val userColor = ColorPicker.nextColor(liveMeeting.props.meetingProp.intId)

    def notifyModeratorsOfGuestWaiting(guest: GuestWaiting, users: Users2x, meetingId: String): Unit = {
      val moderators = Users2x.findAll(users).filter(p => p.role == Roles.MODERATOR_ROLE)
      moderators foreach { mod =>
        val event = MsgBuilder.buildGuestsWaitingForApprovalEvtMsg(meetingId, mod.intId, Vector(guest))
        outGW.send(event)
      }
      // bbb-html should only listen for this single message
      val event = MsgBuilder.buildGuestsWaitingForApprovalEvtMsg(meetingId, "nodeJSapp", Vector(guest))
      outGW.send(event)

      val notifyEvent = MsgBuilder.buildNotifyRoleInMeetingEvtMsg(
        Roles.MODERATOR_ROLE,

        liveMeeting.props.meetingProp.intId,
        "info",
        "user",
        "app.userList.guest.pendingGuestAlert",
        "Notification that a new guest user joined the session",
        Map("0" -> s"${guest.name}")
      )
      outGW.send(notifyEvent)
      NotificationDAO.insert(notifyEvent)
    }

    def registerUserInRegisteredUsers() = {
      val regUser = RegisteredUsers.create(liveMeeting.props.meetingProp.intId, msg.body.intId, msg.body.voiceUserId,
        msg.body.callerIdName, "", "", Roles.VIEWER_ROLE, msg.body.intId, Vector(""), "", "", userColor, false,
        true, true, GuestStatus.WAIT, true, "", "", Map(), false)
      RegisteredUsers.add(liveMeeting.registeredUsers, regUser, liveMeeting.props.meetingProp.intId)
    }

    def registerUserInUsers2x() = {
      val newUser = UserState(
        intId = msg.body.intId,
        extId = msg.body.voiceUserId,
        meetingId = liveMeeting.props.meetingProp.intId,
        name = msg.body.callerIdName,
        role = Roles.VIEWER_ROLE,
        bot = false,
        guest = true,
        authed = true,
        guestStatus = GuestStatus.WAIT,
        reactionEmoji = "none",
        raiseHand = false,
        away = false,
        pin = false,
        mobile = false,
        presenter = false,
        locked = MeetingStatus2x.getPermissions(liveMeeting.status).lockOnJoin,
        avatar = "",
        webcamBackground = "",
        color = userColor,
        clientType = if (isDialInUser) "dial-in-user" else "",
        userLeftFlag = UserLeftFlag(false, 0)
      )
      Users2x.add(liveMeeting.users2x, newUser)
    }

    def registerUserAsGuest() = {
      if (GuestsWaiting.findWithIntId(liveMeeting.guestsWaiting, msg.body.intId).isEmpty) {
        val guest = GuestWaiting(
          msg.body.intId,
          msg.body.callerIdName,
          Roles.VIEWER_ROLE,
          guest = true,
          avatar = "",
          webcamBackground = "",
          userColor,
          authenticated = true,
          System.currentTimeMillis()
        )
        GuestsWaiting.add(liveMeeting.guestsWaiting, guest)
        notifyModeratorsOfGuestWaiting(guest, liveMeeting.users2x, liveMeeting.props.meetingProp.intId)

        VoiceApp.toggleUserAudioInVoiceConf(
          liveMeeting,
          outGW,
          msg.body.intId,
          msg.body.voiceUserId,
          enabled = false
        )
      }
    }

    def letUserEnter() = {
      VoiceApp.handleUserJoinedVoiceConfEvtMsg(
        liveMeeting,
        outGW,
        eventBus,
        msg.body.voiceConf,
        msg.body.intId,
        msg.body.voiceUserId,
        msg.body.callingWith,
        msg.body.callerIdName,
        msg.body.callerIdNum,
        userColor,
        msg.body.muted,
        listenOnlyInputDevice = false,
        deafened = false,
        msg.body.talking,
        "freeswitch",
        msg.body.hold,
        msg.body.uuid
      )
    }

    //Firs of all we check whether the user is banned from the meeting
    if (VoiceUsers.isCallerBanned(msg.body.callerIdNum, liveMeeting.voiceUsers)) {
      log.info("Ejecting banned voice user " + msg)
      val event = MsgBuilder.buildEjectUserFromVoiceConfSysMsg(
        props.meetingProp.intId,
        props.voiceProp.voiceConf,
        msg.body.voiceUserId
      )
      outGW.send(event)
    } else {
      if (isDialInUser) {
        // Guest lobby is always disabled for dial-in users joining via LiveKit
        // as it's not fully supported yet.
        val enforceGuestPolicy = dialInEnforceGuestPolicy && !isUsingLiveKitAudio(liveMeeting)

        registerUserInRegisteredUsers()
        registerUserInUsers2x()

        if (enforceGuestPolicy) {
          guestPolicy match {
            case GuestPolicy(policy, setBy) => {
              policy match {
                case GuestPolicyType.ALWAYS_ACCEPT => letUserEnter()
                case GuestPolicyType.ALWAYS_DENY   => VoiceApp.removeUserFromVoiceConf(liveMeeting, outGW, msg.body.voiceUserId)
                case GuestPolicyType.ASK_MODERATOR => registerUserAsGuest()
              }
            }
          }
        } else {
          letUserEnter()
        }
      } else {
        // Regular users reach this point after beeing
        // allowed to join
        letUserEnter()
      }
    }
  }
}
