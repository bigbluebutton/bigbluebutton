import { gql } from '@apollo/client';

const MEETING_SUBSCRIPTION = gql`
  subscription MeetingSubscription {
      meeting {
        createdTime
        disabledFeatures
        durationInSeconds
        extId
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
        }
        metadata {
          name
          value
        }
        maxPinnedCameras
        meetingCameraCap
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
        screenshare {
          hasAudio
          screenshareId
          stream
          vidHeight
          vidWidth
          voiceConf
          screenshareConf
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
        html5InstanceId
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
        }
      }
  }
`;

export default MEETING_SUBSCRIPTION;
