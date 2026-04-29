package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ GroupChat, GroupChatMessage, Roles, UserState }
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }

trait PinChatMessageHelpers extends HandlerHelpers {

  protected def withPinPermission(
      meetingId:        String,
      userId:           String,
      chatId:           String,
      messageId:        String,
      state:            MeetingState2x,
      liveMeeting:      LiveMeeting,
      bus:              MessageBus,
      permissionReason: String
  )(action: (UserState, GroupChat, GroupChatMessage) => MeetingState2x): MeetingState2x = {
    val chatDisabled = liveMeeting.props.meetingProp.disabledFeatures.contains("chat")
    val chatPinningDisabled = liveMeeting.props.meetingProp.disabledFeatures.contains("pinChatMessage")
    var newState = state

    if (!chatDisabled && !chatPinningDisabled) {
      for {
        user <- org.bigbluebutton.core.models.Users2x.findWithIntId(liveMeeting.users2x, userId)
        groupChat <- state.groupChats.find(chatId)
        gcMessage <- groupChat.msgs.find(gcm => gcm.id == messageId)
      } yield {
        if (user.role != Roles.MODERATOR_ROLE) {
          PermissionCheck.ejectUserForFailedPermission(meetingId, userId, permissionReason, bus.outGW, liveMeeting)
        } else {
          newState = action(user, groupChat, gcMessage)
        }
      }
    }

    newState
  }
}
