import React from 'react';
import { useMutation } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import Toggle from '/imports/ui/components/common/switch/component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import Styled from './styles';
import { SET_DISABLED_FEATURES, SetDisabledFeaturesMutationVars } from './mutations';
import useMeeting from '../../core/hooks/useMeeting';
import MeetingStaticDataStore from '/imports/ui/core/singletons/meetingStaticData';

interface DisabledFeaturesContainerProps {
  setIsOpen: (isOpen: boolean) => void;
}

interface DisabledFeaturesComponentProps {
  disabledFeatures: string[];
  handleDisabledFeaturesSubmit: (features: string[]) => void;
  closeModal: () => void;
  initialSettings: string[];
}

const intlMessages = defineMessages({
  title: {
    id: 'app.disable-features.title',
    defaultMessage: 'Disable features',
  },
  description: {
    id: 'app.disable-features.description',
    defaultMessage: 'Change session disable features settings.',
  },
  buttonApply: {
    id: 'app.disable-features.button.apply',
    defaultMessage: 'Apply',
  },
  buttonCancel: {
    id: 'app.disable-features.button.cancel',
    defaultMessage: 'Cancel',
  },

  // Features
  breakoutRoomsLabel: {
    id: 'app.disable-features.breakoutRoomsLabel',
    defaultMessage: 'Create Breakout Rooms',
  },
  captionsLabel: {
    id: 'app.disable-features.captionsLabel',
    defaultMessage: 'Use Closed Captions',
  },
  chatLabel: {
    id: 'app.disable-features.chatLabel',
    defaultMessage: 'Send Public Chat Messages',
  },
  privateChatLabel: {
    id: 'app.disable-features.privateChatLabel',
    defaultMessage: 'Send Private Chat Messages',
  },
  deleteChatMessageLabel: {
    id: 'app.disable-features.deleteChatMessageLabel',
    defaultMessage: 'Delete Chat Messages',
  },
  editChatMessageLabel: {
    id: 'app.disable-features.editChatMessageLabel',
    defaultMessage: 'Edit Chat Messages',
  },
  replyChatMessageLabel: {
    id: 'app.disable-features.replyChatMessageLabel',
    defaultMessage: 'Reply to Chat Messages',
  },
  chatMessageReactionsLabel: {
    id: 'app.disable-features.chatMessageReactionsLabel',
    defaultMessage: 'React to Chat Messages',
  },
  downloadPresentationWithAnnotationsLabel: {
    id: 'app.disable-features.downloadPresentationWithAnnotationsLabel',
    defaultMessage: 'Download Presentation with Annotations',
  },
  downloadPresentationConvertedToPdfLabel: {
    id: 'app.disable-features.downloadPresentationConvertedToPdfLabel',
    defaultMessage: 'Download Presentation as PDF',
  },
  downloadPresentationOriginalFileLabel: {
    id: 'app.disable-features.downloadPresentationOriginalFileLabel',
    defaultMessage: 'Download Original Presentation File',
  },
  snapshotOfCurrentSlideLabel: {
    id: 'app.disable-features.snapshotOfCurrentSlideLabel',
    defaultMessage: 'Take Snapshot of Current Slide',
  },
  externalVideosLabel: {
    id: 'app.disable-features.externalVideosLabel',
    defaultMessage: 'Share External Videos',
  },
  importPresentationWithAnnotationsFromBreakoutRoomsLabel: {
    id: 'app.disable-features.importPresentationWithAnnotationsFromBreakoutRoomsLabel',
    defaultMessage: 'Import Presentations from Breakout Rooms',
  },
  importSharedNotesFromBreakoutRoomsLabel: {
    id: 'app.disable-features.importSharedNotesFromBreakoutRoomsLabel',
    defaultMessage: 'Import Shared Notes from Breakout Rooms',
  },
  layoutsLabel: {
    id: 'app.disable-features.layoutsLabel',
    defaultMessage: 'Change Layouts',
  },
  learningDashboardLabel: {
    id: 'app.disable-features.learningDashboardLabel',
    defaultMessage: 'View Learning Dashboard',
  },
  learningDashboardDownloadSessionDataLabel: {
    id: 'app.disable-features.learningDashboardDownloadSessionDataLabel',
    defaultMessage: 'Download Learning Dashboard Data',
  },
  pollsLabel: {
    id: 'app.disable-features.pollsLabel',
    defaultMessage: 'Create and Participate in Polls',
  },
  screenshareLabel: {
    id: 'app.disable-features.screenshareLabel',
    defaultMessage: 'Share Screen',
  },
  sharedNotesLabel: {
    id: 'app.disable-features.sharedNotesLabel',
    defaultMessage: 'Edit Shared Notes',
  },
  virtualBackgroundsLabel: {
    id: 'app.disable-features.virtualBackgroundsLabel',
    defaultMessage: 'Use Virtual Backgrounds',
  },
  customVirtualBackgroundsLabel: {
    id: 'app.disable-features.customVirtualBackgroundsLabel',
    defaultMessage: 'Upload Custom Virtual Backgrounds',
  },
  liveTranscriptionLabel: {
    id: 'app.disable-features.liveTranscriptionLabel',
    defaultMessage: 'Enable Live Transcription',
  },
  presentationLabel: {
    id: 'app.disable-features.presentationLabel',
    defaultMessage: 'Use Presentation',
  },
  cameraAsContentLabel: {
    id: 'app.disable-features.cameraAsContentLabel',
    defaultMessage: 'Use Camera as Content',
  },
  timerLabel: {
    id: 'app.disable-features.timerLabel',
    defaultMessage: 'Use Meeting Timer',
  },
  infiniteWhiteboardLabel: {
    id: 'app.disable-features.infiniteWhiteboardLabel',
    defaultMessage: 'Use Infinite Whiteboard',
  },
  raiseHandLabel: {
    id: 'app.disable-features.raiseHandLabel',
    defaultMessage: 'Raise Hand',
  },
  userReactionsLabel: {
    id: 'app.disable-features.userReactionsLabel',
    defaultMessage: 'Use Emoji Reactions',
  },
  chatEmojiPickerLabel: {
    id: 'app.disable-features.chatEmojiPickerLabel',
    defaultMessage: 'Use Chat Emoji Picker',
  },
  quizzesLabel: {
    id: 'app.disable-features.quizzesLabel',
    defaultMessage: 'Create and Participate in Quizzes',
  },
});

const supportedFeatures: string[] = [
  'breakoutRooms', 'captions', 'chat', 'privateChat', 'deleteChatMessage', 'editChatMessage',
  'replyChatMessage', 'chatMessageReactions', 'downloadPresentationWithAnnotations',
  'downloadPresentationConvertedToPdf', 'downloadPresentationOriginalFile',
  'snapshotOfCurrentSlide', 'externalVideos', 'importPresentationWithAnnotationsFromBreakoutRooms',
  'importSharedNotesFromBreakoutRooms', 'layouts', 'learningDashboard',
  'learningDashboardDownloadSessionData', 'polls', 'screenshare', 'sharedNotes',
  'virtualBackgrounds', 'customVirtualBackgrounds', 'liveTranscription', 'presentation',
  'cameraAsContent', 'timer', 'infiniteWhiteboard', 'raiseHand', 'userReactions',
  'chatEmojiPicker', 'quizzes',
];

const DisabledFeaturesComponent: React.FC<DisabledFeaturesComponentProps> = ({
  disabledFeatures,
  handleDisabledFeaturesSubmit,
  closeModal,
  initialSettings,
}) => {
  const intl = useIntl();
  const [localDisabled, setLocalDisabled] = React.useState<string[]>(disabledFeatures);

  // Update local state when subscription updates
  React.useEffect(() => {
    setLocalDisabled(disabledFeatures);
  }, [disabledFeatures]);

  const toggleFeature = (feature: string) => {
    setLocalDisabled((prev) => {
      if (prev.includes(feature)) {
        return prev.filter((f) => f !== feature);
      }
      return [...prev, feature];
    });
  };

  const handleCancel = () => {
    setLocalDisabled(disabledFeatures);
    closeModal();
  };

  const handleApply = () => {
    handleDisabledFeaturesSubmit(localDisabled);
    closeModal();
  };

  return (
    <Styled.ModalContainer
      isOpen
      onRequestClose={handleCancel}
      title={intl.formatMessage(intlMessages.title)}
      contentLabel={intl.formatMessage(intlMessages.title)}
    >
      <Styled.Container>
        <Styled.Description>{intl.formatMessage(intlMessages.description)}</Styled.Description>
        <Styled.FeaturesGrid>
          {supportedFeatures.map((feature) => (
            <Styled.FeatureItem key={feature}>
              <Styled.Label>
                {intl.formatMessage(
                  intlMessages[
                  `${feature}Label` as keyof typeof intlMessages
                  ] || { defaultMessage: feature },
                )}
              </Styled.Label>
              <Toggle
              // @ts-ignore
                defaultChecked={!disabledFeatures.includes(feature) || initialSettings.includes(feature)}
                onChange={() => toggleFeature(feature)}
                ariaLabel={feature}
                showToggleLabel={false}
                invertColors
                data-testid={`toggle-${feature}`}
                disabled={initialSettings.includes(feature)}
              />
            </Styled.FeatureItem>
          ))}
        </Styled.FeaturesGrid>
      </Styled.Container>

      <Styled.Footer>
        <Styled.Actions>
          <Styled.ButtonCancel
            color="default"
            label={intl.formatMessage(intlMessages.buttonCancel)}
            onClick={handleCancel}
          />
          <Styled.ButtonApply
            color="primary"
            label={intl.formatMessage(intlMessages.buttonApply)}
            onClick={handleApply}
          />
        </Styled.Actions>
      </Styled.Footer>
    </Styled.ModalContainer>
  );
};

const DisabledFeaturesContainer: React.FC<DisabledFeaturesContainerProps> = ({ setIsOpen }) => {
  const { data: currentUserData } = useCurrentUser((u) => ({
    isModerator: u.isModerator,
  }));
  const meetingStaticData = MeetingStaticDataStore.getMeetingData();
  const amIModerator = currentUserData?.isModerator;

  const {
    data: meeting,
    loading,
  } = useMeeting((m) => ({
    disabledFeatures: m?.disabledFeatures || [],
  }));

  const [setDisabledFeatures] = useMutation<void, SetDisabledFeaturesMutationVars>(
    SET_DISABLED_FEATURES,
  );

  const closeModal = () => setIsOpen(false);
  const disabledFeatures = meeting?.disabledFeatures || [];

  const handleDisabledFeaturesSubmit = (newDisabledFeatures: string[]) => {
    setDisabledFeatures({
      variables: { disabledFeatures: newDisabledFeatures },
    });
  };

  if (!amIModerator || loading) return null;

  return (
    <DisabledFeaturesComponent
      disabledFeatures={disabledFeatures}
      handleDisabledFeaturesSubmit={handleDisabledFeaturesSubmit}
      closeModal={closeModal}
      initialSettings={meetingStaticData?.disabledFeatures || {}}
    />
  );
};

export default DisabledFeaturesContainer;
