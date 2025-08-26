import React from 'react';
import { defineMessages, IntlShape } from 'react-intl';
import { useMutation } from '@apollo/client';
import TextField from '@mui/material/TextField';
import Styled from './styles';
import ModalStyled from '../styles';
import { isUrlValid } from './service';
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

const YOUTUBE_SHORTS_REGEX = new RegExp(/^(?:https?:\/\/)?(?:www\.)?(youtube\.com\/shorts)\/.+$/);
const PANOPTO_MATCH_URL = /https?:\/\/([^/]+\/Panopto)(\/Pages\/Viewer\.aspx\?id=)([-a-zA-Z0-9]+)/;

const YOUTUBE_REGEX = new RegExp(/^(?:https?:\/\/)?(?:www\.)?(youtube\.com|youtu.be)\/.+$/);

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
  const [startExternalVideo] = useMutation(EXTERNAL_VIDEO_START);
  const startWatching = (url: string) => {
    let externalVideoUrl = url;

    if (YOUTUBE_SHORTS_REGEX.test(url)) {
      const shortsUrl = url.replace('shorts/', 'watch?v=');
      externalVideoUrl = shortsUrl;
    } else if (PANOPTO_MATCH_URL.test(url)) {
      const m = url.match(PANOPTO_MATCH_URL);
      if (m && m.length >= 4) {
        externalVideoUrl = `https://${m[1]}/Podcast/Social/${m[3]}.mp4`;
      }
    }

    if (YOUTUBE_REGEX.test(externalVideoUrl)) {
      const YTUrl = new URL(externalVideoUrl);
      YTUrl.searchParams.delete('list');
      YTUrl.searchParams.delete('index');
      externalVideoUrl = YTUrl.toString();
    }

    startExternalVideo({ variables: { externalVideoUrl } });
  };

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
              setVideoUrl(event.target.value);
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
              startWatching(videoUrl);
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
