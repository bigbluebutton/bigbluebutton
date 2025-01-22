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
- `breakoutPolicies`
- `clientSettings`
- `componentsFlags`
- `externalVideo`
- `groups`
- `layout`
- `learningDashboard`
- `lockSettings`
- `metadata`
- `polls`
- `recording`
- `recordingPolicies`
- `screenshare`
- `timer`
- `usersPolicies`
- `voiceSettings`

## Type: user_current
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
- `breakoutRooms`
- `cameras`
- `chats`
- `connectionStatus`
- `guestStatusDetails`
- `lastBreakoutRoom`
- `livekit`
- `meeting`
- `presPagesWritable`
- `sessionCurrent`
- `sharedNotesSession`
- `transcriptionError`
- `userClientSettings`
- `userLockSettings`
- `userMetadata`
- `voice`
- `welcomeMsgs`

## Type: chat_message_private
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
- `deletedBy`
- `reactions`
- `replyToMessage`
- `user`

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
- `deletedBy`
- `reactions`
- `replyToMessage`
- `user`

## Type: user
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
- `cameras`
- `connectionStatus`
- `lastBreakoutRoom`
- `meeting`
- `presPagesWritable`
- `userLockSettings`
- `voice`

## Type: user_ref
### Fields:
- `authed`
- `avatar`
- `away`
- `banned`
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
- `reactionEmoji`
- `registeredOn`
- `role`
- `speechLocale`
- `userId`

## Type: pres_annotation_curr
### Fields:
- `annotationId`
- `annotationInfo`
- `lastUpdatedAt`
- `pageId`
- `presentationId`
- `userId`
### Relationships:
- `user`

## Type: pres_annotation_history_curr
### Fields:
- `annotationId`
- `annotationInfo`
- `pageId`
- `presentationId`
- `updatedAt`
- `userId`
### Relationships:
- `user`

## Type: user_camera
### Fields:
- `contentType`
- `hasAudio`
- `showAsContent`
- `streamId`
- `userId`
### Relationships:
- `user`
- `voice`

## Type: breakoutRoom_user
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
- `user`

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
- `isSharedNotedPinned`
- `showRemainingTime`

## Type: pres_page
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
- `presentation`

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
- `spoke`
- `startTime`
- `talking`
- `userId`
- `voiceConf`
- `voiceConfCallState`
- `voiceUserId`
### Relationships:
- `user`

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
- `questionText`
- `secret`
- `type`
### Relationships:
- `options`
- `responses`
- `userCurrent`
- `users`

## Type: poll_option
### Fields:
- `optionDesc`
- `optionId`
- `pollId`

## Type: poll_response
### Fields:
- `optionDesc`
- `optionId`
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
- `user`

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
- `assignedUsers`
- `participants`

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
- `user`

## Type: pres_presentation
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
- `totalPages`
- `totalPagesUploaded`
- `uploadCompleted`
- `uploadErrorDetailsJson`
- `uploadErrorMsgKey`
- `uploadInProgress`
- `uploadTemporaryId`
### Relationships:
- `pages`

## Type: caption_activeLocales
### Fields:
- `captionType`
- `locale`
### Relationships:
- `userOwner`

## Type: v_meeting_usersPolicies
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

## Type: breakoutRoom_assignedUser
### Fields:
- `userId`
### Relationships:
- `user`

## Type: breakoutRoom_participant
### Fields:
- `isAudioOnly`
- `userId`
### Relationships:
- `user`

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
- `participant`

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
- `creator`

## Type: user_connectionStatus
### Fields:
- `connectionAliveAt`
- `meetingId`
- `networkRttInMs`
- `status`
- `statusUpdatedAt`
- `userId`
### Relationships:
- `user`

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
### Fields:
- `groupId`
- `name`
- `usersExtId`

## Type: user_guest
### Fields:
- `guestLobbyMessage`
- `guestStatus`
- `isAllowed`
- `isDenied`
- `isWaiting`
- `positionInWaitingQueue`
- `userId`
### Relationships:
- `user`

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
### Fields:
- `chatId`
- `isCurrentlyTyping`
- `lastTypingAt`
- `startedTypingAt`
- `userId`
### Relationships:
- `user`

## Type: user_typing_public
### Fields:
- `chatId`
- `isCurrentlyTyping`
- `lastTypingAt`
- `startedTypingAt`
- `userId`
### Relationships:
- `user`

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
### Fields:
- `padId`
- `sessionId`
- `sharedNotesExtId`
### Relationships:
- `sharedNotes`

## Type: user_breakoutRoom
### Fields:
- `breakoutRoomId`
- `currentlyInRoom`
- `isDefaultName`
- `sequence`
- `shortName`
- `userId`

## Type: user_connectionStatusReport
### Fields:
- `clientNotResponding`
- `connectionAliveAt`
- `currentStatus`
- `lastUnstableStatus`
- `lastUnstableStatusAt`
- `userId`
### Relationships:
- `user`

## Type: user_reaction
### Fields:
- `createdAt`
- `expiresAt`
- `reactionEmoji`
- `userId`
### Relationships:
- `user`

## Type: user_reaction_current
### Fields:
- `reactionEmoji`
- `userId`
### Relationships:
- `user`

## Type: user_welcomeMsgs
### Fields:
- `welcomeMsg`
- `welcomeMsgForModerators`

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
- `user`

## Type: v_meeting_learningDashboard
### Fields:
- `learningDashboardAccessToken`

## Type: meeting_clientPluginSettings
### Fields:
- `dataChannels`
- `name`
- `settings`
- `url`

## Type: pollUserCurrent
### Fields:
- `responded`

## Type: pres_presentation_uploadToken
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
- `user`

## Type: notification
### Fields:
- `createdAt`
- `icon`
- `isSingleUserNotification`
- `messageDescription`
- `messageId`
- `messageValues`
- `notificationType`
- `role`

## Type: user_lockSettings
### Fields:
- `disablePublicChat`

## Type: meeting_metadata
### Fields:
- `name`
- `value`

## Type: user_transcriptionError
### Fields:
- `errorCode`
- `errorMessage`
- `lastUpdatedAt`

## Type: chat_message_reaction
### Fields:
- `createdAt`
- `reactionEmoji`
- `reactionEmojiId`
- `userId`
### Relationships:
- `user`

## Type: plugin
### Fields:
- `javascriptEntrypointIntegrity`
- `javascriptEntrypointUrl`
- `name`

## Type: user_presenceLog
### Fields:
- `currentlyInMeeting`
- `extId`
- `isModerator`
- `userId`

## Type: breakoutRoom_createdLatest
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

## Type: v_user_livekit
### Fields:
- `livekitToken`
### Relationships:
- `user`

## Type: user_session
### Fields:
- `connectionsAlive`
- `enforceLayout`
- `sessionName`
- `sessionToken`

## Type: user_session_current
### Fields:
- `enforceLayout`
- `sessionName`
- `sessionToken`

