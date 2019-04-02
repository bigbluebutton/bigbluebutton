package org.bigbluebutton.client.meeting

import org.bigbluebutton.common2.msgs._

import scala.collection.immutable.HashSet

class AllowedMessageNames {

}

object AllowedMessageNames {
  val MESSAGES = HashSet(
    // User Messages
    ValidateAuthTokenReqMsg.NAME,
    GetUsersMeetingReqMsg.NAME,
    GetGuestsWaitingApprovalReqMsg.NAME,
    UserJoinMeetingReqMsg.NAME,
    UserJoinMeetingAfterReconnectReqMsg.NAME,
    AssignPresenterReqMsg.NAME,
    ChangeUserEmojiCmdMsg.NAME,
    UserBroadcastCamStartMsg.NAME,
    UserBroadcastCamStopMsg.NAME,
    LogoutAndEndMeetingCmdMsg.NAME,
    GetRecordingStatusReqMsg.NAME,
    MeetingActivityResponseCmdMsg.NAME,
    SetRecordingStatusCmdMsg.NAME,
    EjectUserFromMeetingCmdMsg.NAME,
    IsMeetingMutedReqMsg.NAME,
    LockUsersInMeetingCmdMsg.NAME,
    LockUserInMeetingCmdMsg.NAME,
    GetLockSettingsReqMsg.NAME,
    ChangeLockSettingsInMeetingCmdMsg.NAME,
    ChangeUserRoleCmdMsg.NAME,
    GetGuestPolicyReqMsg.NAME,
    SetGuestPolicyCmdMsg.NAME,
    GuestsWaitingApprovedMsg.NAME,
    UserActivitySignCmdMsg.NAME,

    // Webcams
    GetWebcamsOnlyForModeratorReqMsg.NAME,

    // Voice
    MuteMeetingCmdMsg.NAME,
    MuteAllExceptPresentersCmdMsg.NAME,
    MuteUserCmdMsg.NAME,
    EjectUserFromVoiceCmdMsg.NAME,

    // Chat Messages
    GetGroupChatsReqMsg.NAME,
    GetGroupChatMsgsReqMsg.NAME,
    SendGroupChatMessageMsg.NAME,
    ClearPublicChatHistoryPubMsg.NAME,
    CreateGroupChatReqMsg.NAME,
    UserTypingPubMsg.NAME,

    // Presentation Messages
    ResizeAndMovePagePubMsg.NAME,
    SetCurrentPresentationPubMsg.NAME,
    SetCurrentPagePubMsg.NAME,
    GetAllPresentationPodsReqMsg.NAME,
    RemovePresentationPubMsg.NAME,
    SetPresentationDownloadablePubMsg.NAME,
    PresentationUploadTokenReqMsg.NAME,
    CreateNewPresentationPodPubMsg.NAME,
    RemovePresentationPodPubMsg.NAME,
    SetPresenterInPodReqMsg.NAME,

    // Whiteboard Messages
    ModifyWhiteboardAccessPubMsg.NAME,
    UndoWhiteboardPubMsg.NAME,
    ClearWhiteboardPubMsg.NAME,
    GetWhiteboardAnnotationsReqMsg.NAME,
    SendWhiteboardAnnotationPubMsg.NAME,
    SendCursorPositionPubMsg.NAME,

    // Polling Messages
    StartCustomPollReqMsg.NAME,
    StartPollReqMsg.NAME,
    StopPollReqMsg.NAME,
    RespondToPollReqMsg.NAME,
    ShowPollResultReqMsg.NAME,

    // Screenshare Messages
    GetScreenshareStatusReqMsg.NAME,

    // Caption Messages
    SendCaptionHistoryReqMsg.NAME,
    UpdateCaptionOwnerPubMsg.NAME,
    EditCaptionHistoryPubMsg.NAME,

    // Shared Notes Messages
    GetSharedNotesPubMsg.NAME,
    CreateSharedNoteReqMsg.NAME,
    DestroySharedNoteReqMsg.NAME,
    UpdateSharedNoteReqMsg.NAME,
    SyncSharedNotePubMsg.NAME,
    ClearSharedNotePubMsg.NAME,

    // Layout Messages
    GetCurrentLayoutReqMsg.NAME,
    BroadcastLayoutMsg.NAME,

    // Breakout
    CreateBreakoutRoomsCmdMsg.NAME,
    RequestBreakoutJoinURLReqMsg.NAME,
    TransferUserToMeetingRequestMsg.NAME,
    EndAllBreakoutRoomsMsg.NAME,
    BreakoutRoomsListMsg.NAME,

    // System
    ClientToServerLatencyTracerMsg.NAME,

    // Third-party Message
    LookUpUserReqMsg.NAME
  )
}
