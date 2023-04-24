package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.util.ColorPicker
import org.bigbluebutton.core2.MeetingStatus2x

trait UserJoinedVoiceConfEvtMsgHdlr extends SystemConfiguration {
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
    }

    def registerUserInRegisteredUsers() = {
      val regUser = RegisteredUsers.create(msg.body.intId, msg.body.voiceUserId,
        msg.body.callerIdName, Roles.VIEWER_ROLE, "", userColor,
        "", true, true, GuestStatus.WAIT, true, false)
      RegisteredUsers.add(liveMeeting.registeredUsers, regUser)
    }

    def registerUserInUsers2x() = {
      val newUser = UserState(
        intId = msg.body.intId,
        extId = msg.body.voiceUserId,
        name = msg.body.callerIdName,
        role = Roles.VIEWER_ROLE,
        guest = true,
        authed = true,
        guestStatus = GuestStatus.WAIT,
        emoji = "none",
        pin = false,
        mobile = false,
        presenter = false,
        locked = MeetingStatus2x.getPermissions(liveMeeting.status).lockOnJoin,
        avatar = "",
        color = userColor,
        clientType = "",
        pickExempted = false,
        userLeftFlag = UserLeftFlag(false, 0)
      )
      Users2x.add(liveMeeting.users2x, newUser)
    }

    def registerUserAsGuest() = {
      if (GuestsWaiting.findWithIntId(liveMeeting.guestsWaiting, msg.body.intId) == None) {
        val guest = GuestWaiting(msg.body.intId, msg.body.callerIdName, Roles.VIEWER_ROLE, true, "", userColor, true, System.currentTimeMillis())
        GuestsWaiting.add(liveMeeting.guestsWaiting, guest)
        notifyModeratorsOfGuestWaiting(guest, liveMeeting.users2x, liveMeeting.props.meetingProp.intId)

        VoiceApp.toggleUserAudioInVoiceConf(
          liveMeeting,
          outGW,
          msg.body.voiceUserId,
          false
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
        msg.body.talking,
        "freeswitch"
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
        registerUserInRegisteredUsers()
        registerUserInUsers2x()
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
        // Regular users reach this point after beeing
        // allowed to join
        letUserEnter()
      }
    }
  }
}
