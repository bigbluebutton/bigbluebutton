package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.VoiceUsers
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.core.models._
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.core.apps.users.UsersApp
import org.bigbluebutton.core.models.UserLeftFlag

trait UserJoinedVoiceConfEvtMsgHdlr extends SystemConfiguration {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserJoinedVoiceConfEvtMsg(msg: UserJoinedVoiceConfEvtMsg): Unit = {

    val guestPolicy = GuestsWaiting.getGuestPolicy(liveMeeting.guestsWaiting)
    val currentTime = System.currentTimeMillis()
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
        msg.body.muted,
        msg.body.talking,
        "freeswitch"
      )
    }

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

    def denyUser() = {
      val g = GuestApprovedVO(msg.body.voiceUserId, GuestStatus.DENY)
      UsersApp.approveOrRejectGuest(liveMeeting, outGW, g, SystemUser.ID)
      val event = MsgBuilder.buildEjectUserFromVoiceConfSysMsg(liveMeeting.props.meetingProp.intId, liveMeeting.props.voiceProp.voiceConf, msg.body.voiceUserId)
      outGW.send(event)
    }
    if (VoiceUsers.isCallerBanned(msg.body.callerIdNum, liveMeeting.voiceUsers)) {
      log.info("Ejecting banned voice user " + msg)
      val event = MsgBuilder.buildEjectUserFromVoiceConfSysMsg(
        props.meetingProp.intId,
        props.voiceProp.voiceConf,
        msg.body.voiceUserId
      )
      outGW.send(event)
    } else {
      guestPolicy match {
        case GuestPolicy(policy, setBy) => {
          policy match {
            case GuestPolicyType.ALWAYS_ACCEPT => letUserEnter()
            case GuestPolicyType.ALWAYS_DENY   => denyUser()
            case GuestPolicyType.ASK_MODERATOR => {
              if (GuestsWaiting.findWithIntId(liveMeeting.guestsWaiting, msg.body.intId) == None) {
                val guest = GuestWaiting(msg.body.voiceUserId, msg.body.callerIdName, Roles.VIEWER_ROLE, true, "", true, currentTime)
                GuestsWaiting.add(liveMeeting.guestsWaiting, guest)
                notifyModeratorsOfGuestWaiting(Vector(guest), liveMeeting.users2x, liveMeeting.props.meetingProp.intId)
              }
            }
          }
        }
      }
    }
  }
}
