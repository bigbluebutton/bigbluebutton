import React from 'react';
import { defineMessages, IntlShape } from 'react-intl';
import TextField from '@mui/material/TextField';
import Styled from './styles';
import ModalStyled from '../styles';
import { isUrlValid, startWatching } from '/imports/ui/components/external-video-player/service';
import { useMutation } from '@apollo/client';
import { EXTERNAL_VIDEO_START } from '/imports/ui/components/external-video-player/mutations';

const intlMessages = defineMessages({
  shareLabel: {
    id: 'app.mediaSharing.modal.share',
    description: 'Label for the share button in the sharing media modal',
  },
  stopSharingLabel: {
    id: 'app.mediaSharing.modal.stopSharing',
    description: 'Label for the stop sharing button in the sharing media modal',
  },
  urlError: {
    id: 'app.externalVideo.urlError',
    description: 'Not a video URL error',
  },
  urlInput: {
    id: 'app.externalVideo.urlInput',
    description: 'URL input field placeholder',
  },
  noteSupported: {
    id: 'app.externalVideo.noteLabelSupported',
    description: 'provides hint about supported Shared External videos',
  },
  noteWarning: {
    id: 'app.externalVideo.noteLabelWarning',
    description: 'provides hint that shared videos are not in the recording',
  },
});

interface ExternalVideoViewProps {
  intl: IntlShape;
  isSharingVideo: boolean;
  onActionCompleted: () => void;
  stopExternalVideoShare: () => void;
}

const ExternalVideoView: React.FC<ExternalVideoViewProps> = ({
  intl,
  onActionCompleted,
  isSharingVideo,
  stopExternalVideoShare,
}) => {
  const [videoUrl, setVideoUrl] = React.useState('');
  const [startExternalVideoMutation] = useMutation(EXTERNAL_VIDEO_START);
  const startWatchingImp = startWatching(startExternalVideoMutation);

  const valid = isUrlValid(videoUrl);

  const canStartSharing = (videoUrl !== '' && valid) && !isSharingVideo;

  return (
    <>
      <Styled.Content>
        <ModalStyled.SubViewContentText>
          <TextField
            sx={{ marginBottom: '0rem' }}
            error={!valid && videoUrl !== ''}
            helperText={!valid && videoUrl !== '' ? intl.formatMessage(intlMessages.urlError) : ''}
            value={videoUrl}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setVideoUrl(event.target.value.trim());
            }}
            id="standard-basic"
            placeholder={intl.formatMessage(intlMessages.urlInput)}
            variant="standard"
            fullWidth
          />
          <Styled.NoteContainer>
            <span>{intl.formatMessage(intlMessages.noteSupported)}</span>
            <span>{intl.formatMessage(intlMessages.noteWarning)}</span>
          </Styled.NoteContainer>
        </ModalStyled.SubViewContentText>
      </Styled.Content>
      <ModalStyled.FooterContainer>
        <ModalStyled.ConfirmationButton
          // aria-label={footerButtonLabel}
          data-test={!isSharingVideo ? 'ShareExternalVideo' : 'StopSharingExternalVideo'}
          label={!isSharingVideo
            ? intl.formatMessage(intlMessages.shareLabel) : intl.formatMessage(intlMessages.stopSharingLabel)}
          color={!isSharingVideo ? 'primary' : 'danger'}
          onClick={() => {
            if (!isSharingVideo) {
              startWatchingImp(videoUrl);
              onActionCompleted();
            } else {
              stopExternalVideoShare();
            }
          }}
          disabled={!canStartSharing && !isSharingVideo}
          icon={isSharingVideo ? 'external-video_off' : undefined}
        />
      </ModalStyled.FooterContainer>
    </>
  );
};

export default ExternalVideoView;
