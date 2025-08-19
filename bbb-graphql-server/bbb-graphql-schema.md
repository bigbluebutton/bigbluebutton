# GraphQL Schema (BigBlueButton)

## Type: meeting
### Fields:
- `audioBridge`
- `bannerColor`
- `bannerText`
- `cameraBridge`
- `createdAt`
- `createdTime`
- `customDarkLogoUrl`
- `customLogoUrl`
- `disabledFeatures`
- `durationInSeconds`
- `endWhenNoModerator`
- `endWhenNoModeratorDelayInMinutes`
- `ended`
- `endedAt`
- `endedBy`
- `endedByUserName`
- `endedReasonCode`
- `extId`
- `isBreakout`
- `loginUrl`
- `logoutUrl`
- `maxPinnedCameras`
- `meetingCameraCap`
- `meetingId`
- `name`
- `notifyRecordingIsOn`
- `presentationUploadExternalDescription`
- `presentationUploadExternalUrl`
- `screenShareBridge`
### Relationships:
- `breakoutPolicies: Object` [Type meeting_breakoutPolicies](#type-meeting_breakoutPolicies)
- `clientSettings: Object` [Type meeting_clientSettings](#type-meeting_clientSettings)
- `componentsFlags: Object` **Type meeting_componentsFlags**
  - `hasBreakoutRoom: Boolean`
  - `hasCameraAsContent: Boolean`
  - `hasCaption: Boolean`
  - `hasCurrentPresentation: Boolean`
  - `hasExternalVideo: Boolean`
  - `hasPoll: Boolean`
  - `hasScreenshare: Boolean`
  - `hasTimer: Boolean`
  - `isSharedNotesPinned: Boolean`
  - `showRemainingTime: Boolean`
- `externalVideo: Object` [Type externalVideo](#type-externalVideo)
- `groups: Array` [Type meeting_group](#type-meeting_group)
- `layout: Object` [Type layout](#type-layout)
- `learningDashboard: Object` [Type meeting_learningDashboard](#type-meeting_learningDashboard)
- `lockSettings: Object` [Type meeting_lockSettings](#type-meeting_lockSettings)
- `polls: Array` [Type poll](#type-poll)
- `recording: Object` [Type meeting_recording](#type-meeting_recording)
- `recordingPolicies: Object` [Type meeting_recordingPolicies](#type-meeting_recordingPolicies)
- `screenshare: Object` [Type screenshare](#type-screenshare)
- `timer: Object` [Type timer](#type-timer)
- `usersPolicies: Object` [Type meeting_usersPolicies](#type-meeting_usersPolicies)
- `voiceSettings: Object` [Type meeting_voiceSettings](#type-meeting_voiceSettings)

## Type: user_current
Permission: Restricted to User Viewing Self-Related Data
### Fields:
- `authToken`
- `authed`
- `avatar`
- `away`
- `banned`
- `captionLocale`
- `clientType`
- `color`
- `currentlyInMeeting`
- `disconnected`
- `echoTestRunningAt`
- `ejectReason`
- `ejectReasonCode`
- `ejected`
- `enforceLayout`
- `expired`
- `extId`
- `firstName`
- `firstNameSortable`
- `guest`
- `guestStatus`
- `hasDrawPermissionOnCurrentPage`
- `inactivityWarningDisplay`
- `inactivityWarningTimeoutSecs`
- `isDialIn`
- `isModerator`
- `isRunningEchoTest`
- `joinErrorCode`
- `joinErrorMessage`
- `joined`
- `lastName`
- `lastNameSortable`
- `locked`
- `loggedOut`
- `logoutUrl`
- `mobile`
- `name`
- `nameSortable`
- `pinned`
- `presenter`
- `raiseHand`
- `reactionEmoji`
- `registeredAt`
- `registeredOn`
- `role`
- `speechLocale`
- `userId`
- `webcamBackground`
### Relationships:
- `breakoutRooms: Array` [Type breakoutRooms](#type-breakoutroom)
- `cameras: Array` [Type camera](#type-user_camera)
- `chats: Array` [Type chat](#type-chat)
- `connectionStatus: Object` [Type user_connectionStatus](#type-user_connectionstatus)
- `guestStatusDetails: Object` [Type user_guest](#type-user_guest)
- `lastBreakoutRoom: Object` [Type user_breakoutroom](#type-user_breakoutroom)
- `livekit: Object` [Type user_livekit](#type-user_livekit)
- `meeting: Object` [Type meeting](#type-meeting)
- `presPagesWritable: Array` [Type pres_page_writers](#type-pres_page_writers)
- `sessionCurrent: Object` [Type user_session_current](#type-user_session_current)
- `sharedNotesSession: Object` [Type sharedNotes_session](#type-sharedNotes_session)
- `transcriptionError: Object` [Type user_transcriptionError](#type-user_transcriptionError)
- `userClientSettings: Object` [Type user_clientSettings](#type-user_clientSettings)
- `userLockSettings: Object` **Type user_lockSettings**
  - `disablePublicChat`
- `userMetadata: Object` [Type user_metadata](#type-user_metadata)
- `voice: Object` [Type user_voice](#type-user_voice)
- `welcomeMsgs: Object` [Type user_welcomeMsgs](#type-user_welcomeMsgs)

## Type: chat_message_private
Permission: Restricted to User Viewing Self-Related Data
### Fields:
- `chatEmphasizedText`
- `chatId`
- `correlationId`
- `createdAt`
- `deletedAt`
- `editedAt`
- `message`
- `messageId`
- `messageMetadata`
- `messageSequence`
- `messageType`
- `recipientHasSeen`
- `senderId`
- `senderName`
- `senderRole`
### Relationships:
- `deletedBy: Object` [Type User](#type-user)
- `reactions: Array` **Type chat_message_reaction**
  - `createdAt`
  - `reactionEmoji`
  - `userId`
  - `user: Object` [Type User](#type-user)
- `replyToMessage: Object` [Type chat_message_private](#type-chat_message_private)
- `user: Object` [Type User](#type-user)

## Type: chat_message_public
### Fields:
- `chatEmphasizedText`
- `chatId`
- `correlationId`
- `createdAt`
- `deletedAt`
- `editedAt`
- `message`
- `messageId`
- `messageMetadata`
- `messageSequence`
- `messageType`
- `senderId`
- `senderName`
- `senderRole`
### Relationships:
- `deletedBy: Object` [Type User](#type-user)
- `reactions: Array` **Type chat_message_reaction**
  - `createdAt`
  - `reactionEmoji`
  - `userId`
  - `user: Object` [Type User](#type-user)
- `replyToMessage: Object` [Type type-chat_message_public](#type-chat_message_public)
- `user: Object` [Type User](#type-user)

## Type: user
Permission: Restricted by Lock Settings
### Fields:
- `authed`
- `avatar`
- `away`
- `awayTime`
- `banned`
- `bot`
- `captionLocale`
- `clientType`
- `color`
- `currentlyInMeeting`
- `disconnected`
- `expired`
- `extId`
- `firstName`
- `firstNameSortable`
- `guest`
- `guestStatus`
- `hasDrawPermissionOnCurrentPage`
- `isDialIn`
- `isModerator`
- `isRunningEchoTest`
- `joined`
- `lastName`
- `lastNameSortable`
- `locked`
- `loggedOut`
- `mobile`
- `name`
- `nameSortable`
- `pinned`
- `presenter`
- `raiseHand`
- `raiseHandTime`
- `reactionEmoji`
- `registeredAt`
- `registeredOn`
- `role`
- `speechLocale`
- `userId`
### Relationships:
- `cameras: Array` [Type user_camera](#type-user_camera)
- `connectionStatus: Object` [Type user_connectionstatus](#type-user_connectionstatus)
- `lastBreakoutRoom: Object` [Type user_breakoutRoom](#type-user_breakoutRoom)
- `meeting: Object` [Type meeting](#type-meeting)
- `presPagesWritable: Array` [Type pres_page_writers](#type-pres_page_writers)
- `userLockSettings: Object` **Type user_lockSettings**
  - `disablePublicChat`
- `voice: Object` [Type user_voice](#type-user_voice)

## Type: pres_annotation_curr
### Fields:
- `annotationId`
- `annotationInfo`
- `lastUpdatedAt`
- `pageId`
- `presentationId`
- `userId`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: pres_annotation_history_curr
### Fields:
- `annotationId`
- `annotationInfo`
- `pageId`
- `presentationId`
- `updatedAt`
- `userId`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: user_camera
Permission: Restricted by Lock Settings
### Fields:
- `contentType`
- `hasAudio`
- `showAsContent`
- `streamId`
- `userId`
### Relationships:
- `user: Object` [Type User](#type-user)
- `voice: Object` [Type user_voice](#type-user_voice)

## Type: breakoutRoom_user
Permission: Restricted to User Viewing Self-Related Data
### Fields:
- `assignedAt`
- `breakoutRoomId`
- `inviteDismissedAt`
- `joinURL`
- `joinedAt`

## Type: chat_user
### Fields:
- `chatId`
- `lastSeenAt`
- `lastTypingAt`
- `meetingId`
- `userId`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: meeting_componentFlags
### Fields:
- `hasBreakoutRoom`
- `hasCameraAsContent`
- `hasCaption`
- `hasCurrentPresentation`
- `hasExternalVideo`
- `hasPoll`
- `hasScreenshare`
- `hasTimer`
- `isSharedNotesPinned`
- `showRemainingTime`

## Type: pres_page
Permission: Restricted to Presenter
### Fields:
- `content`
- `height`
- `heightRatio`
- `infiniteWhiteboard`
- `isCurrentPage`
- `num`
- `pageId`
- `presentationId`
- `scaledHeight`
- `scaledViewBoxHeight`
- `scaledViewBoxWidth`
- `scaledWidth`
- `slideRevealed`
- `urlsJson`
- `viewBoxHeight`
- `viewBoxWidth`
- `width`
- `widthRatio`
- `xOffset`
- `yOffset`
### Relationships:
- `presentation: Object` [Type pres_presentation](#type-pres_presentation)

## Type: pres_page_curr
### Fields:
- `content`
- `downloadFileExtension`
- `downloadFileUri`
- `downloadable`
- `height`
- `heightRatio`
- `infiniteWhiteboard`
- `isCurrentPage`
- `isDefaultPresentation`
- `nextPagesSvg`
- `num`
- `pageId`
- `presentationFilenameConverted`
- `presentationId`
- `presentationName`
- `removable`
- `scaledHeight`
- `scaledViewBoxHeight`
- `scaledViewBoxWidth`
- `scaledWidth`
- `slideRevealed`
- `totalPages`
- `urlsJson`
- `viewBoxHeight`
- `viewBoxWidth`
- `width`
- `widthRatio`
- `xOffset`
- `yOffset`

## Type: user_clientSettings
Permission: Restricted to User Viewing Self-Related Data
### Fields:
- `userClientSettingsJson`
- `userId`

## Type: user_voice
### Fields:
- `callerName`
- `callerNum`
- `callingWith`
- `endTime`
- `floor`
- `joined`
- `lastFloorTime`
- `listenOnly`
- `muted`
- `deafened`
- `spoke`
- `startTime`
- `talking`
- `userId`
- `voiceConf`
- `voiceUserId`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: meeting_lockSettings
### Fields:
- `disableCam`
- `disableMic`
- `disableNotes`
- `disablePrivateChat`
- `disablePublicChat`
- `hasActiveLockSetting`
- `hideUserList`
- `hideViewersAnnotation`
- `hideViewersCursor`
- `lockOnJoin`
- `lockOnJoinConfigurable`
- `webcamsOnlyForModerator`

## Type: poll
### Fields:
- `createdAt`
- `ended`
- `multipleResponses`
- `ownerId`
- `pollId`
- `published`
- `publishedAt`
- `publishedShowingAnswer`
- `questionText`
- `quiz`
- `secret`
- `type`
### Relationships:
- `options: Array` [Type poll_option](#type-poll_option)
- `responses: Array` [Type poll_response](#type-poll_response)
- `userCurrent: Object` **Type poll_user_current**
  - `responded: Boolean`
- `users: Array` [Type poll_user](#type-poll_user)

## Type: poll_option
### Fields:
- `optionDesc`
- `optionId`
- `pollId`

## Type: poll_response
Permission: Restricted to Poll Owner or User Viewing Self-Related Data
### Fields:
- `optionId`
- `optionDesc`
- `correctOption`
- `optionResponsesCount`
- `pollId`
- `pollResponsesCount`
- `questionText`
- `type`

## Type: poll_user
### Fields:
- `optionDescIds`
- `optionIds`
- `pollId`
- `questionText`
- `responded`
- `type`
- `userId`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: breakoutRoom
### Fields:
- `assignedAt`
- `breakoutRoomId`
- `durationInSeconds`
- `endedAt`
- `freeJoin`
- `hasJoined`
- `inviteDismissedAt`
- `isDefaultName`
- `isLastAssignedRoom`
- `isUserCurrentlyInRoom`
- `joinURL`
- `name`
- `sendInvitationToModerators`
- `sequence`
- `shortName`
- `showInvitation`
- `startedAt`
### Relationships:
- `assignedUsers: Array` **Type breakoutRoom_assignedUser** (Restricted to Moderators)
  - `user: Object` [Type User](#type-user)
- `participants: Array` **Type breakoutRoom_participant**
  - `isAudioOnly: Boolean`
  - `user: Object` [Type User](#type-user)

## Type: timer
### Fields:
- `accumulated`
- `active`
- `elapsed`
- `running`
- `songTrack`
- `startedAt`
- `startedOn`
- `stopwatch`
- `time`

## Type: pres_page_cursor
### Fields:
- `isCurrentPage`
- `lastUpdatedAt`
- `pageId`
- `presentationId`
- `userId`
- `xPercent`
- `yPercent`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: pres_presentation
Permission: Restricted to Presenter
### Fields:
- `createdAt`
- `current`
- `downloadFileExtension`
- `downloadFileUri`
- `downloadable`
- `exportToChatCurrentPage`
- `exportToChatHasError`
- `exportToChatInProgress`
- `exportToChatStatus`
- `filenameConverted`
- `isDefault`
- `name`
- `presentationId`
- `removable`
- `uploadCompletionNotified`
- `totalPages`
- `totalPagesUploaded`
- `uploadCompleted`
- `uploadErrorDetailsJson`
- `uploadErrorMsgKey`
- `uploadInProgress`
- `uploadTemporaryId`
### Relationships:
- `pages: Array` [Type pres_page](#type-pres_page)

## Type: caption_activeLocales
### Fields:
- `captionType`
- `locale`
### Relationships:
- `userOwner: Object` [Type User](#type-user)

## Type: meeting_usersPolicies
### Fields:
- `allowModsToEjectCameras`
- `allowModsToUnmuteUsers`
- `allowPromoteGuestToModerator`
- `authenticatedGuest`
- `guestLobbyMessage`
- `guestPolicy`
- `maxUserConcurrentAccesses`
- `maxUsers`
- `meetingLayout`
- `moderatorsCanMuteAudio`
- `moderatorsCanUnmuteAudio`
- `userCameraCap`
- `webcamsOnlyForModerator`

## Type: chat
### Fields:
- `chatId`
- `lastSeenAt`
- `participantId`
- `public`
- `totalMessages`
- `totalUnread`
- `visible`
### Relationships:
- `participant: Object` [Type User](#type-user)

## Type: pluginDataChannelEntry
### Fields:
- `channelName`
- `createdAt`
- `createdBy`
- `entryId`
- `payloadJson`
- `pluginName`
- `subChannelName`
- `toRoles`
### Relationships:
- `creator: Object` [Type User](#type-user)

## Type: user_connectionStatus
### Fields:
- `connectionAliveAt`
- `meetingId`
- `networkRttInMs`
- `status`
- `statusUpdatedAt`
- `userId`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: current_time
### Fields:
- `currentTimeMillis`
- `currentTimestamp`

## Type: externalVideo
### Fields:
- `externalVideoId`
- `externalVideoUrl`
- `playerCurrentTime`
- `playerPlaybackRate`
- `playerPlaying`
- `startedSharingAt`
- `stoppedSharingAt`
- `updatedAt`

## Type: layout
### Fields:
- `cameraDockAspectRatio`
- `cameraDockIsResizing`
- `cameraDockPlacement`
- `cameraWithFocus`
- `currentLayoutType`
- `presentationMinimized`
- `propagateLayout`
- `updatedAt`

## Type: meeting_breakoutPolicies
### Fields:
- `breakoutRooms`
- `captureNotes`
- `captureNotesFilename`
- `captureSlides`
- `captureSlidesFilename`
- `freeJoin`
- `parentId`
- `privateChatEnabled`
- `record`
- `sequence`

## Type: meeting_group
Permission: Restricted to Moderators
### Fields:
- `groupId`
- `groupIndex`
- `name`
- `usersExtId`

## Type: user_guest
Permission: Restricted to Moderators or the User Viewing Self-Related Data
### Fields:
- `guestLobbyMessage`
- `guestStatus`
- `isAllowed`
- `isDenied`
- `isWaiting`
- `positionInWaitingQueue`
- `userId`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: meeting_recording
### Fields:
- `isRecording`
- `previousRecordedTimeInSeconds`
- `startedAt`
- `startedBy`
- `stoppedAt`
- `stoppedBy`

## Type: meeting_recordingPolicies
### Fields:
- `allowStartStopRecording`
- `autoStartRecording`
- `keepEvents`
- `record`

## Type: meeting_voiceSettings
### Fields:
- `dialNumber`
- `muteOnStart`
- `telVoice`
- `voiceConf`

## Type: user_typing_private
Permission: Restricted to User Viewing Self-Related Data
### Fields:
- `chatId`
- `isCurrentlyTyping`
- `lastTypingAt`
- `startedTypingAt`
- `userId`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: user_typing_public
### Fields:
- `chatId`
- `isCurrentlyTyping`
- `lastTypingAt`
- `startedTypingAt`
- `userId`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: pres_page_writers
### Fields:
- `changedModeOn`
- `isCurrentPage`
- `pageId`
- `presentationId`
- `userId`

## Type: screenshare
### Fields:
- `contentType`
- `hasAudio`
- `screenshareConf`
- `screenshareId`
- `startedAt`
- `stoppedAt`
- `stream`
- `vidHeight`
- `vidWidth`
- `voiceConf`

## Type: sharedNotes
### Fields:
- `lastRev`
- `model`
- `name`
- `padId`
- `pinned`
- `sharedNotesExtId`

## Type: sharedNotes_session
Permission: Restricted to User Viewing Self-Related Data
### Fields:
- `padId`
- `sessionId`
- `sharedNotesExtId`
### Relationships:
- `sharedNotes: Object` [Type sharednotes](#type-sharednotes)

## Type: user_breakoutRoom
### Fields:
- `breakoutRoomId`
- `currentlyInRoom`
- `isDefaultName`
- `sequence`
- `shortName`
- `userId`

## Type: user_connectionStatusHistory
Permission: Restricted to Moderators or the User Viewing Self-Related Data
### Fields:
- `networkRttInMs`
- `status`
- `statusUpdatedAt`
- `userId`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: user_connectionStatusReport
Permission: Restricted to Moderators or the User Viewing Self-Related Data
### Fields:
- `clientNotResponding`
- `connectionAliveAt`
- `currentStatus`
- `lastUnstableStatus`
- `lastUnstableStatusAt`
- `userId`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: user_reaction
### Fields:
- `createdAt`
- `expiresAt`
- `reactionEmoji`
- `userId`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: user_reaction_current
### Fields:
- `reactionEmoji`
- `userId`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: user_welcomeMsgs
### Fields:
- `welcomeMsg`
- `welcomeMsgForModerators` (Restricted to Moderators)

## Type: meeting_clientSettings
### Fields:
- `clientSettingsJson`

## Type: caption
### Fields:
- `captionId`
- `captionText`
- `captionType`
- `createdAt`
- `locale`
- `userId`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: meeting_learningDashboard
Permission: Restricted to Moderators
### Fields:
- `learningDashboardAccessToken`

## Type: meeting_clientPluginSettings
### Fields:
- `name`
- `settings`

## Type: pollUserCurrent
Permission: Restricted to User Viewing Self-Related Data
### Fields:
- `responded`

## Type: pres_presentation_uploadToken
Permission: Restricted to User Viewing Self-Related Data
### Fields:
- `presentationId`
- `uploadTemporaryId`
- `uploadToken`

## Type: sharedNotes_diff
### Fields:
- `diff`
- `end`
- `rev`
- `sharedNotesExtId`
- `start`
- `userId`

## Type: user_metadata
Permission: Restricted to User Viewing Self-Related Data
### Fields:
- `parameter`
- `value`

## Type: user_voice_activity
### Fields:
- `endTime`
- `muted`
- `startTime`
- `talking`
- `userId`
- `voiceActivityAt`
### Relationships:
- `user: Object` [Type User](#type-user)

## Type: notification
Permission: Restricted to User Viewing Self-Related Data
### Fields:
- `createdAt`
- `icon`
- `isSingleUserNotification`
- `messageDescription`
- `messageId`
- `messageValues`
- `notificationType`
- `role`

## Type: user_transcriptionError
Permission: Restricted to User Viewing Self-Related Data
### Fields:
- `errorCode`
- `errorMessage`
- `lastUpdatedAt`

## Type: plugin
### Fields:
- `javascriptEntrypointIntegrity`
- `javascriptEntrypointUrl`
- `name`

## Type: user_presenceLog
Permission: Restricted by Lock Settings
### Fields:
- `currentlyInMeeting`
- `extId`
- `isModerator`
- `userId`

## Type: breakoutRoom_createdLatest
Permission: Restricted to Moderators
### Fields:
- `breakoutRoomId`
- `captureNotes`
- `captureSlides`
- `createdAt`
- `durationInSeconds`
- `endedAt`
- `freeJoin`
- `isDefaultName`
- `name`
- `sendInvitationToModerators`
- `sequence`
- `shortName`
- `startedAt`

## Type: user_livekit
Permission: Restricted to User Viewing Self-Related Data
### Fields:
- `livekitToken`

## Type: user_session
Permission: Restricted to User Viewing Self-Related Data
### Fields:
- `connectionsAlive`
- `enforceLayout`
- `sessionName`
- `sessionToken`

## Type: user_session_current
Permission: Restricted to User Viewing Self-Related Data
### Fields:
- `enforceLayout`
- `sessionName`
- `sessionToken`
