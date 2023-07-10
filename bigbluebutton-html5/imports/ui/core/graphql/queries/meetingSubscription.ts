import { gql } from "@apollo/client";

export const MEETING_SUBSCRIPTION = gql`
  subscription MeetingSubscription {
      meeting {
        createdTime
        disabledFeatures
        duration
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
          webcamsOnlyForModerator
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
      }
  }
`;
