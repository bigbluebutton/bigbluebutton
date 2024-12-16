import { gql } from '@apollo/client';

const MEETING_SUBSCRIPTION = gql`
  subscription MeetingSubscription {
      meeting {
        disabledFeatures
        durationInSeconds
        extId
        endWhenNoModerator
        endWhenNoModeratorDelayInMinutes
        createdTime
        loginUrl
        lockSettings {
          disableCam
          disableMic
          disableNotes
          disablePrivateChat
          disablePublicChat
          hasActiveLockSetting
          hideUserList
          hideViewersCursor
          hideViewersAnnotation
          webcamsOnlyForModerator
          lockOnJoin
          lockOnJoinConfigurable
        }
        metadata {
          name
          value
        }
        maxPinnedCameras
        meetingCameraCap
        cameraBridge
        screenShareBridge
        audioBridge
        meetingId
        name
        notifyRecordingIsOn
        presentationUploadExternalDescription
        presentationUploadExternalUrl
        recordingPolicies {
          allowStartStopRecording
          autoStartRecording
          record
          keepEvents
        }
        groups {
          groupId
          name
        }
        learningDashboard {
          learningDashboardAccessToken
        }
        screenshare {
          contentType
          hasAudio
          screenshareConf
          screenshareId
          startedAt
          stoppedAt
          stream
          vidHeight
          vidWidth
          voiceConf
        }
        usersPolicies {
          allowModsToEjectCameras
          allowModsToUnmuteUsers
          authenticatedGuest
          guestPolicy
          maxUserConcurrentAccesses
          maxUsers
          meetingLayout
          moderatorsCanMuteAudio
          moderatorsCanUnmuteAudio
          userCameraCap
          webcamsOnlyForModerator
          guestLobbyMessage
        }
        layout {
          cameraDockAspectRatio
          cameraDockIsResizing
          cameraDockPlacement
          cameraWithFocus
          currentLayoutType
          presentationMinimized
          propagateLayout
          updatedAt
        }
        isBreakout
        breakoutPolicies {
          breakoutRooms
          captureNotes
          captureNotesFilename
          captureSlides
          captureSlidesFilename
          freeJoin
          parentId
          privateChatEnabled
          record
          sequence
        }
        voiceSettings {
          dialNumber
          muteOnStart
          voiceConf
          telVoice
        }
        externalVideo {
          externalVideoId
          playerCurrentTime
          playerPlaybackRate
          playerPlaying
          externalVideoUrl
          startedSharingAt
          stoppedSharingAt
          updatedAt
        }
        componentsFlags {
          hasCaption
          hasBreakoutRoom
          hasExternalVideo
          hasPoll
          hasScreenshare
          hasTimer
          showRemainingTime
          hasCameraAsContent
        }
      }
  }
`;

export default MEETING_SUBSCRIPTION;
