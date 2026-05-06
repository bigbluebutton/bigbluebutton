import { gql } from '@apollo/client';

const MEETING_SUBSCRIPTION = gql`
  subscription MeetingSubscription {
      meeting {
        durationInSeconds
        lockSettings {
          disableCam
          disableMic
          disableNotes
          disablePrivateChat
          disablePublicChat
          presenterPolicy
          hasActiveLockSetting
          hideUserList
          hideViewersCursor
          hideViewersAnnotation
          webcamsOnlyForModerator
          lockOnJoin
          lockOnJoinConfigurable
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
          guestPolicy
          guestLobbyMessage
          webcamsOnlyForModerator
          multiUserWhiteboardEnabled
        }
        layout {
          cameraDockAspectRatio
          cameraDockIsResizing
          cameraDockPlacement
          cameraWithFocus
          currentLayoutType
          presentationMinimized
          propagateLayout
          setByUserId
          updatedAt
        }

        breakoutRoomsCommonProperties {
          durationInSeconds
          freeJoin
          sendInvitationToModerators
          startedAt
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
          hasBreakoutRoom
          hasCameraAsContent
          hasCaption
          hasCurrentPresentation
          hasExternalVideo
          hasPoll
          hasScreenshare
          hasScreenshareAsContent
          hasSharedNotes
          hasTimer
          isSharedNotesPinned
          isEtherpadSharedNotes
          showRemainingTime
          }
    }
  }
`;

export default MEETING_SUBSCRIPTION;
