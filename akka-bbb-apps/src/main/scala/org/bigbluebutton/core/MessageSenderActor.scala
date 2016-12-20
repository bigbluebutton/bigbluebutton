package org.bigbluebutton.core

import akka.actor.Actor
import akka.actor.ActorRef
import akka.actor.ActorLogging
import akka.actor.Props
import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.MessagingConstants
import org.bigbluebutton.core.pubsub.senders.ChatMessageToJsonConverter
import org.bigbluebutton.common.messages.StartRecordingVoiceConfRequestMessage
import org.bigbluebutton.common.messages.StopRecordingVoiceConfRequestMessage
import org.bigbluebutton.core.pubsub.senders.MeetingMessageToJsonConverter
import org.bigbluebutton.core.pubsub.senders.PesentationMessageToJsonConverter
import org.bigbluebutton.core.pubsub.senders.CaptionMessageToJsonConverter
import org.bigbluebutton.core.pubsub.senders.DeskShareMessageToJsonConverter
import org.bigbluebutton.common.messages.GetPresentationInfoReplyMessage
import org.bigbluebutton.common.messages.PresentationRemovedMessage
import org.bigbluebutton.common.messages.AllowUserToShareDesktopReply
import org.bigbluebutton.core.apps.Page

import collection.JavaConverters._
import scala.collection.JavaConversions._
import org.bigbluebutton.core.apps.SimplePollResultOutVO
import org.bigbluebutton.core.apps.SimplePollOutVO
import org.bigbluebutton.core.pubsub.senders.UsersMessageToJsonConverter
import org.bigbluebutton.common.messages.GetUsersFromVoiceConfRequestMessage
import org.bigbluebutton.common.messages.MuteUserInVoiceConfRequestMessage
import org.bigbluebutton.common.messages.EjectUserFromVoiceConfRequestMessage
import org.bigbluebutton.common.messages.GetCurrentLayoutReplyMessage
import org.bigbluebutton.common.messages.BroadcastLayoutMessage
import org.bigbluebutton.common.messages.UserEjectedFromMeetingMessage
import org.bigbluebutton.common.messages.LockLayoutMessage
import org.bigbluebutton.core.pubsub.senders.WhiteboardMessageToJsonConverter
import org.bigbluebutton.common.converters.ToJsonEncoder
import org.bigbluebutton.common.messages.TransferUserToVoiceConfRequestMessage
import org.bigbluebutton.core

object MessageSenderActor {
  def props(msgSender: MessageSender): Props =
    Props(classOf[MessageSenderActor], msgSender)
}

class MessageSenderActor(val service: MessageSender)
    extends Actor with ActorLogging {

  val encoder = new ToJsonEncoder()
  def receive = {
    case msg: UserEjectedFromMeeting => handleUserEjectedFromMeeting(msg)
    case msg: GetChatHistoryReply => handleGetChatHistoryReply(msg)
    case msg: SendPublicMessageEvent => handleSendPublicMessageEvent(msg)
    case msg: SendPrivateMessageEvent => handleSendPrivateMessageEvent(msg)
    case msg: MeetingCreated => handleMeetingCreated(msg)
    case msg: VoiceRecordingStarted => handleVoiceRecordingStarted(msg)
    case msg: VoiceRecordingStopped => handleVoiceRecordingStopped(msg)
    case msg: RecordingStatusChanged => handleRecordingStatusChanged(msg)
    case msg: GetRecordingStatusReply => handleGetRecordingStatusReply(msg)
    case msg: MeetingEnding => handleMeetingEnding(msg)
    case msg: MeetingEnded => handleMeetingEnded(msg)
    case msg: MeetingHasEnded => handleMeetingHasEnded(msg)
    case msg: MeetingDestroyed => handleMeetingDestroyed(msg)
    case msg: KeepAliveMessageReply => handleKeepAliveMessageReply(msg)
    case msg: PubSubPong => handlePubSubPong(msg)
    case msg: StartRecording => handleStartRecording(msg)
    case msg: StopRecording => handleStopRecording(msg)
    case msg: GetAllMeetingsReply => handleGetAllMeetingsReply(msg)
    case msg: StartRecordingVoiceConf => handleStartRecordingVoiceConf(msg)
    case msg: StopRecordingVoiceConf => handleStopRecordingVoiceConf(msg)
    case msg: ClearPresentationOutMsg => handleClearPresentationOutMsg(msg)
    case msg: RemovePresentationOutMsg => handleRemovePresentationOutMsg(msg)
    case msg: GetPresentationInfoOutMsg => handleGetPresentationInfoOutMsg(msg)
    case msg: SendCursorUpdateOutMsg => handleSendCursorUpdateOutMsg(msg)
    case msg: ResizeAndMoveSlideOutMsg => handleResizeAndMoveSlideOutMsg(msg)
    case msg: GotoSlideOutMsg => handleGotoSlideOutMsg(msg)
    case msg: SharePresentationOutMsg => handleSharePresentationOutMsg(msg)
    case msg: GetSlideInfoOutMsg => handleGetSlideInfoOutMsg(msg)
    case msg: PresentationConversionProgress => handlePresentationConversionProgress(msg)
    case msg: PresentationConversionError => handlePresentationConversionError(msg)
    case msg: PresentationPageGenerated => handlePresentationPageGenerated(msg)
    case msg: PresentationConversionDone => handlePresentationConversionDone(msg)
    case msg: PollStartedMessage => handlePollStartedMessage(msg)
    case msg: PollStoppedMessage => handlePollStoppedMessage(msg)
    case msg: PollShowResultMessage => handlePollShowResultMessage(msg)
    case msg: PollHideResultMessage => handlePollHideResultMessage(msg)
    case msg: UserRespondedToPollMessage => handleUserRespondedToPollMessage(msg)
    case msg: MeetingMuted => handleMeetingMuted(msg)
    case msg: MeetingState => handleMeetingState(msg)
    case msg: DisconnectAllUsers => handleDisconnectAllUsers(msg)
    case msg: AllowUserToShareDesktopOut => handleAllowUserToShareDesktopOut(msg)
    case msg: DisconnectUser => handleDisconnectUser(msg)
    case msg: PermissionsSettingInitialized => handlePermissionsSettingInitialized(msg)
    case msg: NewPermissionsSetting => handleNewPermissionsSetting(msg)
    case msg: UserLocked => handleUserLocked(msg)
    case msg: GetPermissionsSettingReply => handleGetPermissionsSettingReply(msg)
    case msg: UserRegistered => handleUserRegistered(msg)
    case msg: UserLeft => handleUserLeft(msg)
    case msg: PresenterAssigned => handlePresenterAssigned(msg)
    case msg: EndAndKickAll => handleEndAndKickAll(msg)
    case msg: GetUsersReply => handleGetUsersReply(msg)
    case msg: ValidateAuthTokenReply => handleValidateAuthTokenReply(msg)
    case msg: ValidateAuthTokenTimedOut => handleValidateAuthTokenTimedOut(msg)
    case msg: UserJoined => handleUserJoined(msg)
    case msg: UserChangedEmojiStatus => handleChangedUserEmojiStatus(msg)
    case msg: UserSharedWebcam => handleUserSharedWebcam(msg)
    case msg: UserUnsharedWebcam => handleUserUnsharedWebcam(msg)
    case msg: UserStatusChange => handleUserStatusChange(msg)
    case msg: UserVoiceMuted => handleUserVoiceMuted(msg)
    case msg: UserVoiceTalking => handleUserVoiceTalking(msg)
    case msg: MuteVoiceUser => handleMuteVoiceUser(msg)
    case msg: EjectVoiceUser => handleEjectVoiceUser(msg)
    case msg: TransferUserToMeeting => handleTransferUserToMeeting(msg)
    case msg: GetUsersInVoiceConference => handleGetUsersFromVoiceConference(msg)
    case msg: UserJoinedVoice => handleUserJoinedVoice(msg)
    case msg: UserLeftVoice => handleUserLeftVoice(msg)
    case msg: IsMeetingMutedReply => handleIsMeetingMutedReply(msg)
    case msg: UserListeningOnly => handleUserListeningOnly(msg)
    case msg: GetCurrentLayoutReply => handleGetCurrentLayoutReply(msg)
    case msg: BroadcastLayoutEvent => handleBroadcastLayoutEvent(msg)
    case msg: LockLayoutEvent => handleLockLayoutEvent(msg)
    case msg: GetWhiteboardShapesReply => handleGetWhiteboardShapesReply(msg)
    case msg: SendWhiteboardAnnotationEvent => handleSendWhiteboardAnnotationEvent(msg)
    case msg: ClearWhiteboardEvent => handleClearWhiteboardEvent(msg)
    case msg: UndoWhiteboardEvent => handleUndoWhiteboardEvent(msg)
    case msg: WhiteboardEnabledEvent => handleWhiteboardEnabledEvent(msg)
    case msg: IsWhiteboardEnabledReply => handleIsWhiteboardEnabledReply(msg)
    // breakout room cases
    case msg: BreakoutRoomsListOutMessage => handleBreakoutRoomsListOutMessage(msg)
    case msg: BreakoutRoomStartedOutMessage => handleBreakoutRoomStartedOutMessage(msg)
    case msg: BreakoutRoomEndedOutMessage => handleBreakoutRoomEndedOutMessage(msg)
    case msg: BreakoutRoomJoinURLOutMessage => handleBreakoutRoomJoinURLOutMessage(msg)
    case msg: UpdateBreakoutUsersOutMessage => handleUpdateBreakoutUsersOutMessage(msg)
    case msg: MeetingTimeRemainingUpdate => handleMeetingTimeRemainingUpdate(msg)
    case msg: BreakoutRoomsTimeRemainingUpdateOutMessage => handleBreakoutRoomsTimeRemainingUpdate(msg)

    case msg: SendCaptionHistoryReply => handleSendCaptionHistoryReply(msg)
    case msg: UpdateCaptionOwnerReply => handleUpdateCaptionOwnerReply(msg)
    case msg: EditCaptionHistoryReply => handleEditCaptionHistoryReply(msg)
    case msg: DeskShareStartRTMPBroadcast => handleDeskShareStartRTMPBroadcast(msg)
    case msg: DeskShareStopRTMPBroadcast => handleDeskShareStopRTMPBroadcast(msg)
    case msg: DeskShareNotifyViewersRTMP => handleDeskShareNotifyViewersRTMP(msg)
    case msg: DeskShareNotifyASingleViewer => handleDeskShareNotifyASingleViewer(msg)
    case msg: DeskShareHangUp => handleDeskShareHangUp(msg)
    case _ => // do nothing
  }

  private def handleUserEjectedFromMeeting(msg: UserEjectedFromMeeting) {
    val m = new UserEjectedFromMeetingMessage(msg.meetingID, msg.userId, msg.ejectedBy)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, m.toJson)
  }

  private def handleDeskShareHangUp(msg: DeskShareHangUp) {
    val json = DeskShareMessageToJsonConverter.getDeskShareHangUpToJson(msg)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, json)
  }

  private def handleDeskShareStopRTMPBroadcast(msg: DeskShareStopRTMPBroadcast) {
    val json = DeskShareMessageToJsonConverter.getDeskShareStopRTMPBroadcastToJson(msg)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, json)
  }

  private def handleDeskShareNotifyViewersRTMP(msg: DeskShareNotifyViewersRTMP) {
    val json = DeskShareMessageToJsonConverter.getDeskShareNotifyViewersRTMPToJson(msg)
    service.send(MessagingConstants.FROM_DESK_SHARE_CHANNEL, json)
  }

  def handleDeskShareNotifyASingleViewer(msg: DeskShareNotifyASingleViewer) {
    val json = DeskShareMessageToJsonConverter.getDeskShareNotifyASingleViewerToJson(msg)
    service.send(MessagingConstants.FROM_DESK_SHARE_CHANNEL, json)
  }

  private def handleDeskShareStartRTMPBroadcast(msg: DeskShareStartRTMPBroadcast) {
    val json = DeskShareMessageToJsonConverter.getDeskShareStartRTMPBroadcastToJson(msg)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, json)
  }

  private def handleGetChatHistoryReply(msg: GetChatHistoryReply) {
    val json = ChatMessageToJsonConverter.getChatHistoryReplyToJson(msg)
    service.send(MessagingConstants.FROM_CHAT_CHANNEL, json)
  }

  private def handleSendPublicMessageEvent(msg: SendPublicMessageEvent) {
    val json = ChatMessageToJsonConverter.sendPublicMessageEventToJson(msg)
    service.send(MessagingConstants.FROM_CHAT_CHANNEL, json)
  }

  private def handleSendPrivateMessageEvent(msg: SendPrivateMessageEvent) {
    val json = ChatMessageToJsonConverter.sendPrivateMessageEventToJson(msg)
    service.send(MessagingConstants.FROM_CHAT_CHANNEL, json)
  }

  private def handleStartRecordingVoiceConf(msg: StartRecordingVoiceConf) {
    val m = new StartRecordingVoiceConfRequestMessage(msg.meetingID, msg.voiceConfId)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, m.toJson())
  }

  private def handleStopRecordingVoiceConf(msg: StopRecordingVoiceConf) {
    val m = new StopRecordingVoiceConfRequestMessage(msg.meetingID, msg.voiceConfId, msg.recordedStream)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, m.toJson())
  }

  private def handleMeetingDestroyed(msg: MeetingDestroyed) {
    val json = MeetingMessageToJsonConverter.meetingDestroyedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handlePubSubPong(msg: PubSubPong) {
    val json = encoder.encodePubSubPongMessage(msg.system, msg.timestamp)
    service.send(MessagingConstants.FROM_SYSTEM_CHANNEL, json)
  }

  private def handleKeepAliveMessageReply(msg: KeepAliveMessageReply) {
    val json = MeetingMessageToJsonConverter.keepAliveMessageReplyToJson(msg)
    service.send(MessagingConstants.FROM_SYSTEM_CHANNEL, json)
  }

  private def handleMeetingCreated(msg: MeetingCreated) {
    val json = MeetingMessageToJsonConverter.meetingCreatedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleMeetingEnded(msg: MeetingEnded) {
    val json = MeetingMessageToJsonConverter.meetingEndedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)

    val json2 = UsersMessageToJsonConverter.meetingEnded(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json2)
  }

  private def handleMeetingEnding(msg: MeetingEnding) {
    val json = MeetingMessageToJsonConverter.meetingEndingToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleStartRecording(msg: StartRecording) {
    val json = MeetingMessageToJsonConverter.startRecordingToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleStopRecording(msg: StopRecording) {
    val json = MeetingMessageToJsonConverter.stopRecordingToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleVoiceRecordingStarted(msg: VoiceRecordingStarted) {
    val json = MeetingMessageToJsonConverter.voiceRecordingStartedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleVoiceRecordingStopped(msg: VoiceRecordingStopped) {
    val json = MeetingMessageToJsonConverter.voiceRecordingStoppedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleRecordingStatusChanged(msg: RecordingStatusChanged) {
    val json = MeetingMessageToJsonConverter.recordingStatusChangedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)

    val json2 = UsersMessageToJsonConverter.recordingStatusChangedToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json2)
  }

  private def handleGetRecordingStatusReply(msg: GetRecordingStatusReply) {
    val json = MeetingMessageToJsonConverter.getRecordingStatusReplyToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)

    val json2 = UsersMessageToJsonConverter.getRecordingStatusReplyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json2)
  }

  private def handleMeetingHasEnded(msg: MeetingHasEnded) {
    val json = MeetingMessageToJsonConverter.meetingHasEndedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)

    val json2 = UsersMessageToJsonConverter.meetingHasEnded(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json2)
  }

  private def handleGetAllMeetingsReply(msg: GetAllMeetingsReply) {
    val json = MeetingMessageToJsonConverter.getAllMeetingsReplyToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def pageToMap(page: Page): java.util.Map[String, Any] = {
    val res = new scala.collection.mutable.HashMap[String, Any]
    res += "id" -> page.id
    res += "num" -> page.num
    res += "thumb_uri" -> page.thumbUri
    res += "swf_uri" -> page.swfUri
    res += "txt_uri" -> page.txtUri
    res += "svg_uri" -> page.svgUri
    res += "current" -> page.current
    res += "x_offset" -> page.xOffset
    res += "y_offset" -> page.yOffset
    res += "width_ratio" -> page.widthRatio
    res += "height_ratio" -> page.heightRatio

    mapAsJavaMap(res)
  }

  private def handleClearPresentationOutMsg(msg: ClearPresentationOutMsg) {
    val json = PesentationMessageToJsonConverter.clearPresentationOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleRemovePresentationOutMsg(msg: RemovePresentationOutMsg) {
    val m = new PresentationRemovedMessage(msg.meetingID, msg.presentationID)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, m.toJson())
  }

  private def handleGetPresentationInfoOutMsg(msg: GetPresentationInfoOutMsg) {
    // Create a map for our current presenter
    val presenter = new java.util.HashMap[String, Object]()
    presenter.put(Constants.USER_ID, msg.info.presenter.userId)
    presenter.put(Constants.NAME, msg.info.presenter.name)
    presenter.put(Constants.ASSIGNED_BY, msg.info.presenter.assignedBy)

    // Create an array for our presentations
    val presentations = new java.util.ArrayList[java.util.Map[String, Object]]
    msg.info.presentations.foreach { pres =>
      val presentation = new java.util.HashMap[String, Object]()
      presentation.put(Constants.ID, pres.id)
      presentation.put(Constants.NAME, pres.name)
      presentation.put(Constants.CURRENT, pres.current: java.lang.Boolean)

      // Get the pages for a presentation
      val pages = new java.util.ArrayList[java.util.Map[String, Any]]()
      pres.pages.values foreach { p =>
        pages.add(pageToMap(p))
      }
      // store the pages in the presentation 
      presentation.put(Constants.PAGES, pages)

      // add this presentation into our presentations list
      presentations.add(presentation);
    }

    val reply = new GetPresentationInfoReplyMessage(msg.meetingID, msg.requesterID, presenter, presentations)

    val json = PesentationMessageToJsonConverter.getPresentationInfoOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleSendCursorUpdateOutMsg(msg: SendCursorUpdateOutMsg) {
    val json = PesentationMessageToJsonConverter.sendCursorUpdateOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleResizeAndMoveSlideOutMsg(msg: ResizeAndMoveSlideOutMsg) {
    val json = PesentationMessageToJsonConverter.resizeAndMoveSlideOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleGotoSlideOutMsg(msg: GotoSlideOutMsg) {
    val json = PesentationMessageToJsonConverter.gotoSlideOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleSharePresentationOutMsg(msg: SharePresentationOutMsg) {
    val json = PesentationMessageToJsonConverter.sharePresentationOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleGetSlideInfoOutMsg(msg: GetSlideInfoOutMsg) {
    val json = PesentationMessageToJsonConverter.getSlideInfoOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleGetPreuploadedPresentationsOutMsg(msg: GetPreuploadedPresentationsOutMsg) {
    val json = PesentationMessageToJsonConverter.getPreuploadedPresentationsOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handlePresentationConversionProgress(msg: PresentationConversionProgress) {
    val json = PesentationMessageToJsonConverter.presentationConversionProgressToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handlePresentationConversionError(msg: PresentationConversionError) {
    val json = PesentationMessageToJsonConverter.presentationConversionErrorToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handlePresentationPageGenerated(msg: PresentationPageGenerated) {
    val json = PesentationMessageToJsonConverter.presentationPageGenerated(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handlePresentationConversionDone(msg: PresentationConversionDone) {
    val json = PesentationMessageToJsonConverter.presentationConversionDoneToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handlePresentationChanged(msg: PresentationChanged) {
    val json = PesentationMessageToJsonConverter.presentationChangedToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleGetPresentationStatusReply(msg: GetPresentationStatusReply) {
    val json = PesentationMessageToJsonConverter.getPresentationStatusReplyToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handlePresentationRemoved(msg: PresentationRemoved) {
    val json = PesentationMessageToJsonConverter.presentationRemovedToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handlePageChanged(msg: PageChanged) {
    val json = PesentationMessageToJsonConverter.pageChangedToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handlePollStartedMessage(msg: PollStartedMessage) {
    val json = pollStartedMessageToJson(msg)
    service.send(MessagingConstants.FROM_POLLING_CHANNEL, json)
  }

  private def handlePollStoppedMessage(msg: PollStoppedMessage) {
    val json = pollStoppedMessageToJson(msg)
    service.send(MessagingConstants.FROM_POLLING_CHANNEL, json)
  }

  private def handlePollShowResultMessage(msg: PollShowResultMessage) {
    val json = pollShowResultMessageToJson(msg)
    service.send(MessagingConstants.FROM_POLLING_CHANNEL, json)
  }

  private def handlePollHideResultMessage(msg: PollHideResultMessage) {
    val json = pollHideResultMessageToJson(msg)
    service.send(MessagingConstants.FROM_POLLING_CHANNEL, json)
  }

  private def handleUserRespondedToPollMessage(msg: UserRespondedToPollMessage) {
    val json = UserRespondedToPollMessageTpJson(msg)
    service.send(MessagingConstants.FROM_POLLING_CHANNEL, json)
  }

  private def pollVOtoMap(msg: SimplePollOutVO): java.util.HashMap[String, Object] = {
    val pollVO = new java.util.HashMap[String, Object]()
    pollVO.put("id", msg.id)

    val answers = new java.util.ArrayList[java.util.Map[String, Any]];
    msg.answers.foreach(ans => {
      val amap = new java.util.HashMap[String, Any]()
      amap.put("id", ans.id)
      amap.put("key", ans.key)
      answers.add(amap)
    })

    pollVO.put("answers", answers)

    pollVO
  }

  private def pollStartedMessageToJson(msg: PollStartedMessage): String = {
    val pollVO = pollVOtoMap(msg.poll)
    val psm = new org.bigbluebutton.common.messages.PollStartedMessage(msg.meetingID, msg.requesterId, pollVO)
    psm.toJson
  }

  private def pollStoppedMessageToJson(msg: PollStoppedMessage): String = {
    val psm = new org.bigbluebutton.common.messages.PollStoppedMessage(msg.meetingID, msg.requesterId, msg.pollId)
    psm.toJson
  }

  private def pollResultVOtoMap(msg: SimplePollResultOutVO): java.util.HashMap[String, Object] = {
    val pollVO = new java.util.HashMap[String, Object]()
    pollVO.put("id", msg.id)
    pollVO.put("num_respondents", msg.numRespondents: java.lang.Integer)
    pollVO.put("num_responders", msg.numResponders: java.lang.Integer)
    val answers = new java.util.ArrayList[java.util.Map[String, Any]];
    msg.answers.foreach(ans => {
      val amap = new java.util.HashMap[String, Any]()
      amap.put("id", ans.id)
      amap.put("key", ans.key)
      amap.put("num_votes", ans.numVotes)
      answers.add(amap)
    })

    pollVO.put("answers", answers)

    pollVO
  }

  private def pollShowResultMessageToJson(msg: PollShowResultMessage): String = {
    val pollResultVO = pollResultVOtoMap(msg.poll)

    val psm = new org.bigbluebutton.common.messages.PollShowResultMessage(msg.meetingID, pollResultVO)
    psm.toJson
  }

  private def pollHideResultMessageToJson(msg: PollHideResultMessage): String = {
    val psm = new org.bigbluebutton.common.messages.PollHideResultMessage(msg.meetingID, msg.pollId)
    psm.toJson
  }

  private def UserRespondedToPollMessageTpJson(msg: UserRespondedToPollMessage): String = {
    val pollResultVO = pollResultVOtoMap(msg.poll)
    val psm = new org.bigbluebutton.common.messages.UserVotedPollMessage(msg.meetingID, msg.presenterId, pollResultVO)
    psm.toJson
  }

  private def handleLockLayoutEvent(msg: LockLayoutEvent) {
    val users = new java.util.ArrayList[String];
    msg.applyTo.foreach(uvo => {
      users.add(uvo.userID)
    })

    val evt = new LockLayoutMessage(msg.meetingID, msg.setById, msg.locked, users)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, evt.toJson())
  }

  private def handleBroadcastLayoutEvent(msg: BroadcastLayoutEvent) {
    val users = new java.util.ArrayList[String];
    msg.applyTo.foreach(uvo => {
      users.add(uvo.userID)
    })

    val evt = new BroadcastLayoutMessage(msg.meetingID, msg.setByUserID, msg.layoutID, msg.locked, users)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, evt.toJson())
  }

  private def handleGetCurrentLayoutReply(msg: GetCurrentLayoutReply) {
    val reply = new GetCurrentLayoutReplyMessage(msg.meetingID, msg.requesterID, msg.setByUserID, msg.layoutID, msg.locked)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, reply.toJson())
  }

  private def handleMeetingState(msg: MeetingState) {
    val json = UsersMessageToJsonConverter.meetingState(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleMeetingMuted(msg: MeetingMuted) {
    val json = UsersMessageToJsonConverter.meetingMuted(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleDisconnectAllUsers(msg: DisconnectAllUsers) {
    val json = UsersMessageToJsonConverter.disconnectAllUsersToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleDisconnectUser(msg: DisconnectUser) {
    val json = UsersMessageToJsonConverter.disconnectUserToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleAllowUserToShareDesktopOut(msg: AllowUserToShareDesktopOut): Unit = {
    val obj = new AllowUserToShareDesktopReply(msg.meetingID, msg.userID, msg.allowed,
      TimestampGenerator.generateTimestamp)
    val json = obj.toJson()
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handlePermissionsSettingInitialized(msg: PermissionsSettingInitialized) {
    val json = UsersMessageToJsonConverter.permissionsSettingInitializedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleNewPermissionsSetting(msg: NewPermissionsSetting) {
    val json = UsersMessageToJsonConverter.newPermissionsSettingToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleUserLocked(msg: UserLocked) {
    val json = UsersMessageToJsonConverter.userLockedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleGetPermissionsSettingReply(msg: GetPermissionsSettingReply) {
    val json = UsersMessageToJsonConverter.getPermissionsSettingReplyToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleUserRegistered(msg: UserRegistered) {
    val json = UsersMessageToJsonConverter.userRegisteredToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
    handleRegisteredUser(msg);
  }

  private def handleUserStatusChange(msg: UserStatusChange) {
    val json = UsersMessageToJsonConverter.userStatusChangeToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleChangedUserEmojiStatus(msg: UserChangedEmojiStatus) {
    val json = UsersMessageToJsonConverter.userChangedEmojiStatusToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserSharedWebcam(msg: UserSharedWebcam) {
    val json = UsersMessageToJsonConverter.userSharedWebcamToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserUnsharedWebcam(msg: UserUnsharedWebcam) {
    val json = UsersMessageToJsonConverter.userUnsharedWebcamToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleGetUsersReply(msg: GetUsersReply) {
    val json = UsersMessageToJsonConverter.getUsersReplyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserJoinedVoice(msg: UserJoinedVoice) {
    val json = UsersMessageToJsonConverter.userJoinedVoice(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserVoiceMuted(msg: UserVoiceMuted) {
    val json = UsersMessageToJsonConverter.userVoiceMuted(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserVoiceTalking(msg: UserVoiceTalking) {
    val json = UsersMessageToJsonConverter.userVoiceTalking(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleMuteVoiceUser(msg: MuteVoiceUser) {
    val m = new MuteUserInVoiceConfRequestMessage(msg.meetingID, msg.voiceConfId, msg.voiceUserId, msg.mute)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, m.toJson())
  }

  private def handleGetUsersFromVoiceConference(msg: GetUsersInVoiceConference) {
    val m = new GetUsersFromVoiceConfRequestMessage(msg.meetingID, msg.voiceConfId)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, m.toJson())
  }

  private def handleEjectVoiceUser(msg: EjectVoiceUser) {
    val m = new EjectUserFromVoiceConfRequestMessage(msg.meetingID, msg.voiceConfId, msg.voiceUserId)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, m.toJson())
  }

  private def handleTransferUserToMeeting(msg: TransferUserToMeeting) {
    val m = new TransferUserToVoiceConfRequestMessage(msg.voiceConfId, msg.targetVoiceConfId, msg.userId);
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, m.toJson())
  }

  private def handleUserLeftVoice(msg: UserLeftVoice) {
    val json = UsersMessageToJsonConverter.userLeftVoiceToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleIsMeetingMutedReply(msg: IsMeetingMutedReply) {
    val json = UsersMessageToJsonConverter.isMeetingMutedReplyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleValidateAuthTokenReply(msg: ValidateAuthTokenReply) {
    println("**** handleValidateAuthTokenReply *****")
    val json = UsersMessageToJsonConverter.validateAuthTokenReplyToJson(msg)
    //println("************** Publishing [" + json + "] *******************")
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleValidateAuthTokenTimedOut(msg: ValidateAuthTokenTimedOut) {
    println("**** handleValidateAuthTokenTimedOut *****")
    val json = UsersMessageToJsonConverter.validateAuthTokenTimeoutToJson(msg)
    //println("************** Publishing [" + json + "] *******************")
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserJoined(msg: UserJoined) {
    val json = UsersMessageToJsonConverter.userJoinedToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleRegisteredUser(msg: UserRegistered) {
    val json = UsersMessageToJsonConverter.userRegisteredToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserLeft(msg: UserLeft) {
    val json = UsersMessageToJsonConverter.userLeftToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handlePresenterAssigned(msg: PresenterAssigned) {
    val json = UsersMessageToJsonConverter.presenterAssignedToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleEndAndKickAll(msg: EndAndKickAll) {
    val json = UsersMessageToJsonConverter.endAndKickAllToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserListeningOnly(msg: UserListeningOnly) {
    val json = UsersMessageToJsonConverter.userListeningOnlyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleGetWhiteboardShapesReply(msg: GetWhiteboardShapesReply) {
    val json = WhiteboardMessageToJsonConverter.getWhiteboardShapesReplyToJson(msg)
    service.send(MessagingConstants.FROM_WHITEBOARD_CHANNEL, json)
  }

  private def handleSendWhiteboardAnnotationEvent(msg: SendWhiteboardAnnotationEvent) {
    val json = WhiteboardMessageToJsonConverter.sendWhiteboardAnnotationEventToJson(msg)
    service.send(MessagingConstants.FROM_WHITEBOARD_CHANNEL, json)
  }

  private def handleClearWhiteboardEvent(msg: ClearWhiteboardEvent) {
    val json = WhiteboardMessageToJsonConverter.clearWhiteboardEventToJson(msg)
    service.send(MessagingConstants.FROM_WHITEBOARD_CHANNEL, json)
  }

  private def handleUndoWhiteboardEvent(msg: UndoWhiteboardEvent) {
    val json = WhiteboardMessageToJsonConverter.undoWhiteboardEventToJson(msg)
    service.send(MessagingConstants.FROM_WHITEBOARD_CHANNEL, json)
  }

  private def handleWhiteboardEnabledEvent(msg: WhiteboardEnabledEvent) {
    val json = WhiteboardMessageToJsonConverter.whiteboardEnabledEventToJson(msg)
    service.send(MessagingConstants.FROM_WHITEBOARD_CHANNEL, json)
  }

  private def handleIsWhiteboardEnabledReply(msg: IsWhiteboardEnabledReply) {
    val json = WhiteboardMessageToJsonConverter.isWhiteboardEnabledReplyToJson(msg)
    service.send(MessagingConstants.FROM_WHITEBOARD_CHANNEL, json)
  }

  private def handleBreakoutRoomsListOutMessage(msg: BreakoutRoomsListOutMessage) {
    val json = MeetingMessageToJsonConverter.breakoutRoomsListOutMessageToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleBreakoutRoomStartedOutMessage(msg: BreakoutRoomStartedOutMessage) {
    val json = MeetingMessageToJsonConverter.breakoutRoomStartedOutMessageToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleBreakoutRoomEndedOutMessage(msg: BreakoutRoomEndedOutMessage) {
    val json = MeetingMessageToJsonConverter.breakoutRoomEndedOutMessageToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleBreakoutRoomJoinURLOutMessage(msg: BreakoutRoomJoinURLOutMessage) {
    val json = MeetingMessageToJsonConverter.breakoutRoomJoinURLOutMessageToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUpdateBreakoutUsersOutMessage(msg: UpdateBreakoutUsersOutMessage) {
    val json = MeetingMessageToJsonConverter.updateBreakoutUsersOutMessageToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleMeetingTimeRemainingUpdate(msg: MeetingTimeRemainingUpdate) {
    val json = MeetingMessageToJsonConverter.meetingTimeRemainingUpdateToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleSendCaptionHistoryReply(msg: SendCaptionHistoryReply) {
    val json = CaptionMessageToJsonConverter.sendCaptionHistoryReplyToJson(msg)
    service.send(MessagingConstants.FROM_CAPTION_CHANNEL, json)
  }

  private def handleUpdateCaptionOwnerReply(msg: UpdateCaptionOwnerReply) {
    val json = CaptionMessageToJsonConverter.updateCaptionOwnerReplyToJson(msg)
    service.send(MessagingConstants.FROM_CAPTION_CHANNEL, json)
  }

  private def handleEditCaptionHistoryReply(msg: EditCaptionHistoryReply) {
    println("handleEditCaptionHistoryReply")
    val json = CaptionMessageToJsonConverter.editCaptionHistoryReplyToJson(msg)
    println(json)
    service.send(MessagingConstants.FROM_CAPTION_CHANNEL, json)
  }

  private def handleBreakoutRoomsTimeRemainingUpdate(msg: BreakoutRoomsTimeRemainingUpdateOutMessage) {
    val json = MeetingMessageToJsonConverter.breakoutRoomsTimeRemainingUpdateToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }
}
