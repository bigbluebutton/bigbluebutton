import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import Styled from './styles';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import { isUrlValid } from './service';
import { EXTERNAL_VIDEO_START } from '../../mutations';

const intlMessages = defineMessages({
  start: {
    id: 'app.externalVideo.start',
    description: 'Share external video',
  },
  urlError: {
    id: 'app.externalVideo.urlError',
    description: 'Not a video URL error',
  },
  input: {
    id: 'app.externalVideo.input',
    description: 'Video URL',
  },
  urlInput: {
    id: 'app.externalVideo.urlInput',
    description: 'URL input field placeholder',
  },
  title: {
    id: 'app.externalVideo.title',
    description: 'Modal title',
  },
  close: {
    id: 'app.externalVideo.close',
    description: 'Close',
  },
  note: {
    id: 'app.externalVideo.noteLabel',
    description: 'provides hint about Shared External videos',
  },
});

const YOUTUBE_SHORTS_REGEX = new RegExp(/^(?:https?:\/\/)?(?:www\.)?(youtube\.com\/shorts)\/.+$/);
const PANOPTO_MATCH_URL = /https?:\/\/([^/]+\/Panopto)(\/Pages\/Viewer\.aspx\?id=)([-a-zA-Z0-9]+)/;

const YOUTUBE_REGEX = new RegExp(/^(?:https?:\/\/)?(?:www\.)?(youtube\.com|youtu.be)\/.+$/);

interface ExternalVideoPlayerModalProps {
  onRequestClose: () => void,
  priority: string,
  setIsOpen: (isOpen: boolean) => void,
  isOpen: boolean,
}

const ExternalVideoPlayerModal: React.FC<ExternalVideoPlayerModalProps> = ({
  isOpen,
  setIsOpen,
  onRequestClose,
  priority,
}) => {
  const intl = useIntl();
  const Settings = getSettingsSingletonInstance();
  // @ts-ignore - settings is a js singleton
  const { animations } = Settings.application;
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

  return (
    <Styled.ExternalVideoModal
      onRequestClose={onRequestClose}
      contentLabel={intl.formatMessage(intlMessages.title)}
      title={intl.formatMessage(intlMessages.title)}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      priority={priority}
    >
      <Styled.Content>
        <Styled.VideoUrl animations={animations}>
          <label htmlFor="video-modal-input">
            {intl.formatMessage(intlMessages.input)}
            <input
              id="video-modal-input"
              onChange={(e) => setVideoUrl(e.target.value)}
              name="video-modal-input"
              placeholder={intl.formatMessage(intlMessages.urlInput)}
              aria-describedby="exernal-video-note"
              onPaste={(e) => { e.stopPropagation(); }}
              onCut={(e) => { e.stopPropagation(); }}
              onCopy={(e) => { e.stopPropagation(); }}
            />
          </label>
          <Styled.ExternalVideoNote id="external-video-note">
            {intl.formatMessage(intlMessages.note)}
          </Styled.ExternalVideoNote>
        </Styled.VideoUrl>
        <div>
          {
            !valid && videoUrl
              ? (
                <Styled.UrlError animations={animations}>
                  {intl.formatMessage(intlMessages.urlError)}
                </Styled.UrlError>
              )
              : null
          }
        </div>

        <Styled.StartButton
          label={intl.formatMessage(intlMessages.start)}
          disabled={!valid || !videoUrl}
          onClick={() => {
            startWatching(videoUrl);
            onRequestClose();
          }}
          data-test="startNewVideo"
          color="primary"
        />
      </Styled.Content>
    </Styled.ExternalVideoModal>
  );
};

export default ExternalVideoPlayerModal;
