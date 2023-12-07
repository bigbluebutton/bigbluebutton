import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import VolumeSlide from './volume-slide/component';
import deviceInfo from '/imports/utils/deviceInfo';
import ReloadButton from './reload-button/component';
import Subtitles from './subtitles/component';
import FullscreenButtonContainer from '/imports/ui/components/common/fullscreen-button/container';
import { uniqueId } from '/imports/utils/string-utils';
import { layoutSelect } from '../../../layout/context';
import { Layout } from '../../../layout/layoutTypes';
import ExternalVideoPlayerProgressBar from './progress-bar/component';

const intlMessages = defineMessages({
  refreshLabel: {
    id: 'app.externalVideo.refreshLabel',
  },
  fullscreenLabel: {
    id: 'app.externalVideo.fullscreenLabel',
  },
  subtitlesOn: {
    id: 'app.externalVideo.subtitlesOn',
  },
  subtitlesOff: {
    id: 'app.externalVideo.subtitlesOff',
  },
});

interface ExternalVideoPlayerToolbarProps {
  hideVolume: boolean;
  volume: number;
  muted: boolean;
  mutedByEchoTest: boolean;
  handleOnMuted: (mute: boolean) => void;
  handleVolumeChanged: (volume: number) => void;
  playing: boolean;
  setShowHoverToolBar: (show: boolean) => void;
  toolbarStyle: string;
  handleReload: () => void;
  toggleSubtitle: () => void;
  playerName: string;
  subtitlesOn: boolean;
  playerParent: HTMLDivElement | null;
  played: number;
  loaded: number;
}

const ExternalVideoPlayerToolbar: React.FC<ExternalVideoPlayerToolbarProps> = ({
  hideVolume,
  volume,
  muted,
  mutedByEchoTest,
  handleOnMuted,
  handleVolumeChanged,
  playing,
  setShowHoverToolBar,
  toolbarStyle,
  handleReload,
  playerName,
  toggleSubtitle,
  subtitlesOn,
  playerParent,
  played,
  loaded,
}) => {
  const intl = useIntl();
  const mobileTimout = React.useRef<ReturnType<typeof setTimeout>>();

  const fullscreen = layoutSelect((i: Layout) => i.fullscreen);
  const { element } = fullscreen;
  const fullscreenContext = (element === 'ExternalVideo');

  return (
    <>
      {
        [
          (
            <Styled.HoverToolbar toolbarStyle={toolbarStyle} key="hover-toolbar-external-video">
              <VolumeSlide
                hideVolume={hideVolume}
                volume={volume}
                muted={muted || mutedByEchoTest}
                onMuted={handleOnMuted}
                onVolumeChanged={handleVolumeChanged}
              />
              <Styled.ButtonsWrapper>
                <ReloadButton
                  handleReload={handleReload}
                  label={intl.formatMessage(intlMessages.refreshLabel)}
                />
                {playerName === 'YouTube' && (
                  <Subtitles
                    toggleSubtitle={toggleSubtitle}
                    label={subtitlesOn
                      ? intl.formatMessage(intlMessages.subtitlesOn)
                      : intl.formatMessage(intlMessages.subtitlesOff)}
                  />
                )}
              </Styled.ButtonsWrapper>
              <FullscreenButtonContainer
                key={uniqueId('fullscreenButton-')}
                elementName={intl.formatMessage(intlMessages.fullscreenLabel)}
                fullscreenRef={playerParent}
                elementId="ExternalVideo"
                isFullscreen={fullscreenContext}
                dark
              />
              <ExternalVideoPlayerProgressBar
                played={played}
                loaded={loaded}
              />
            </Styled.HoverToolbar>
          ),
          (
            deviceInfo.isMobile && playing) && (
              <Styled.MobileControlsOverlay
                key="mobile-overlay-external-video"
                onTouchStart={() => {
                  clearTimeout(mobileTimout.current);
                  setShowHoverToolBar(true);
                }}
                onTouchEnd={() => {
                  mobileTimout.current = setTimeout(
                    () => setShowHoverToolBar(false),
                    5000,
                  );
                }}
              />
          ),
        ]
      }
    </>
  );
};

export default ExternalVideoPlayerToolbar;
