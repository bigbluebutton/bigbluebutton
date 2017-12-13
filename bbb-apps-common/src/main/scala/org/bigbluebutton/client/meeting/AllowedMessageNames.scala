package org.bigbluebutton.client.meeting

import scala.collection.immutable.HashSet

class AllowedMessageNames {
  
}

object AllowedMessageNames {
  val MESSAGES = HashSet(
      // User Messages
      "ValidateAuthTokenReqMsg", "GetUsersMeetingReqMsg","GetGuestsWaitingApprovalReqMsg","UserJoinMeetingReqMsg","UserJoinMeetingAfterReconnectReqMsg","AssignPresenterReqMsg","ChangeUserEmojiCmdMsg","CreateBreakoutRoomsCmdMsg","RequestBreakoutJoinURLReq","TransferUserToMeetingRequestMsg","EndAllBreakoutRoomsMsg","UserBroadcastCamStartMsg","UserBroadcastCamStopMsg","LogoutAndEndMeetingCmdMsg","GetRecordingStatusReqMsg","BreakoutRoomsListMsg","MeetingActivityResponseCmdMsg","SetRecordingStatusCmdMsg","MuteMeetingCmdMsg","MuteAllExceptPresentersCmdMsg","MuteUserCmdMsg","EjectUserFromVoiceCmdMsg","EjectUserFromMeetingCmdMsg","AddUserToPresenterGroupCmdMsg","RemoveUserFromPresenterGroupCmdMsg","GetPresenterGroupReqMsg","IsMeetingMutedReqMsg","LockUsersInMeetingCmdMsg","LockUserInMeetingCmdMsg","GetLockSettingsReqMsg","ChangeLockSettingsInMeetingCmdMsg","ChangeUserRoleCmdMsg","GetGuestPolicyReqMsg","SetGuestPolicyCmdMsg","GuestsWaitingApprovedMsg",
      // Chat Messages
      "GetGroupChatsReqMsg","GetGroupChatMsgsReqMsg","SendGroupChatMessageMsg","ClearPublicChatHistoryPubMsg","CreateGroupChatReqMsg",
      // Presentation Messages
      "ResizeAndMovePagePubMsg","SetCurrentPresentationPubMsg","SetCurrentPagePubMsg","GetPresentationInfoReqMsg","GetAllPresentationPodsReqMsg","RemovePresentationPubMsg","PresentationUploadTokenReqMsg","CreateNewPresentationPodPubMsg","RemovePresentationPodPubMsg","SetPresenterInPodReqMsg",
      // Whiteboard Messages
      "ModifyWhiteboardAccessPubMsg","GetWhiteboardAccessReqMsg","UndoWhiteboardPubMsg","ClearWhiteboardPubMsg","GetWhiteboardAnnotationsReqMsg","SendWhiteboardAnnotationPubMsg","SendCursorPositionPubMsg","ClientToServerLatencyTracerMsg",
      // Polling Messages
      "StartCustomPollReqMsg","StartPollReqMsg","StopPollReqMsg","RespondToPollReqMsg","ShowPollResultReqMsg","HidePollResultReqMsg",
      // Screenshare Messages
      "GetScreenshareStatusReqMsg",
      // Caption Messages
      "SendCaptionHistoryReqMsg","UpdateCaptionOwnerPubMsg","EditCaptionHistoryPubMsg",
      // Shared Notes Messages
      "GetSharedNotesPubMsg","CreateSharedNoteReqMsg","DestroySharedNoteReqMsg","UpdateSharedNoteReqMsg","SyncSharedNotePubMsg","ClearSharedNotePubMsg",
      // Layout Messages
      "GetCurrentLayoutReqMsg","BroadcastLayoutMsg",
    // Breakout
      "RequestBreakoutJoinURLReqMsg")
}